"use client";
/**
 * app/aura8/companion/hooks/useConversation.ts
 *
 * Manages conversation state, history loading, streaming, and token tracking.
 */

import { useState, useEffect, useCallback, useRef } from "react";

export interface Message {
  id:          string;
  role:        "user" | "assistant";
  content:     string;
  tokens_used: number;
  created_at:  string;
  streaming?:  boolean;
}

export interface TokenInfo {
  balance:    number;
  tier:       "lite" | "pro" | "premium" | "unknown";
  dailyUsed:  number;
  dailyLimit: number | null;
  canSend:    boolean;
}

export interface UseConversationReturn {
  messages:         Message[];
  tokenInfo:        TokenInfo | null;
  isLoading:        boolean;
  isLoadingHistory: boolean;
  error:            string | null;
  sendMessage:      (text: string) => Promise<void>;
  clearError:       () => void;
}

interface StreamChunk {
  type: "delta" | "done" | "error";
  text?: string;
  fullText?: string;
  error?: string;
  tokenInfo?: TokenInfo;
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function estimateCost(len: number, tier: string): number {
  if (tier === "premium") return 0;
  if (tier === "pro")     return Math.max(1, Math.ceil(len / 100));
  return 5;
}

export function useConversation(): UseConversationReturn {
  const [messages, setMessages]    = useState<Message[]>([]);
  const [tokenInfo, setTokenInfo]  = useState<TokenInfo | null>(null);
  const [isLoading, setLoading]    = useState(false);
  const [isLoadingHistory, setHist]= useState(true);
  const [error, setError]          = useState<string | null>(null);
  const abortRef                   = useRef<AbortController | null>(null);

  const fetchTokens = useCallback(async () => {
    try {
      const res  = await fetch("/api/aura8/companion/tokens", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setTokenInfo(data as TokenInfo);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    let live = true;
    (async () => {
      await fetchTokens();
      try {
        const res  = await fetch("/api/aura8/companion/history", { credentials: "include" });
        const data = await res.json();
        if (live && Array.isArray(data.messages)) {
          setMessages(data.messages.map((m: Message) => ({ ...m, id: m.id ?? uid() })));
        }
      } catch { /* silent */ }
      finally { if (live) setHist(false); }
    })();
    return () => { live = false; };
  }, [fetchTokens]);

  const sendMessage = useCallback(async (text: string) => {
    const msg = text.trim();
    if (!msg || isLoading) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setError(null);
    setLoading(true);

    const userId   = uid();
    const asstId   = uid();
    const userTurn: Message = { id: userId, role: "user", content: msg,
      tokens_used: estimateCost(msg.length, tokenInfo?.tier ?? "lite"),
      created_at: new Date().toISOString() };
    const placeholder: Message = { id: asstId, role: "assistant", content: "",
      tokens_used: 0, created_at: new Date().toISOString(), streaming: true };

    setMessages(p => [...p, userTurn, placeholder]);

    try {
      const history = messages.filter(m => !m.streaming).slice(-10)
        .map(m => ({ role: m.role as "user"|"assistant", content: m.content }));

      const res = await fetch("/api/aura8/companion/chat", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error((d as {error?: string}).error ?? `Error ${res.status}`);
      }

      const reader  = res.body?.getReader();
      const decoder = new TextDecoder();
      let   buf = "", full = "";

      if (reader) {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            let c: StreamChunk;
            try {
              c = JSON.parse(line) as StreamChunk;
            } catch {
              continue;
            }

            if (c.type === "delta" && c.text) {
                full += c.text;
                setMessages(p => p.map(m => m.id === asstId ? { ...m, content: full } : m));
            } else if (c.type === "done") {
              full = c.fullText ?? full;
              if (c.tokenInfo) setTokenInfo(c.tokenInfo);
            } else if (c.type === "error") {
              throw new Error(c.error ?? "Stream error");
            }
          }
        }
      }

      setMessages(p => p.map(m => m.id === asstId
        ? { ...m, content: full || "I am here with you...", streaming: false } : m));
      await fetchTokens();
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setMessages(p => p.filter(m => m.id !== asstId));
    } finally {
      setLoading(false);
    }
  }, [isLoading, messages, tokenInfo?.tier, fetchTokens]);

  return { messages, tokenInfo, isLoading, isLoadingHistory, error,
    sendMessage, clearError: useCallback(() => setError(null), []) };
}
