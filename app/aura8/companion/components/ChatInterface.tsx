"use client";
import { useRef, useEffect } from "react";
import { useConversation, type Message, type TokenInfo } from "../hooks/useConversation";

const C = { bg:"#060608",surface:"#0D0D0F",border:"#1A1A2E",pink:"#FF006E",pinkDim:"#FF006E20",pinkBorder:"#FF006E40",muted:"#71717A",dimmer:"#52525B",faint:"#3F3F46",text:"#E8E8F0",white:"#FAFAFA",warn:"#F59E0B",error:"#EF4444",errorBg:"#2D0A0A",font:"DM Mono, monospace" };

function TokenBar({ info }: { info: TokenInfo }) {
  const pct = info.dailyLimit ? Math.min(100, (info.dailyUsed / info.dailyLimit) * 100) : 0;
  const lbl = { lite:"LITE",pro:"PRO",premium:"PREMIUM",unknown:"FREE" } as const;
  return (
    <div style={{ padding:"10px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:"14px",fontSize:"10px",color:C.muted }}>
      <span style={{ color:C.pink,fontWeight:700,letterSpacing:"0.1em" }}>{lbl[info.tier as keyof typeof lbl]??info.tier.toUpperCase()}</span>
      <span>{info.balance.toLocaleString()} tokens</span>
      {info.dailyLimit!==null&&<><span style={{color:C.faint}}>·</span><span>{info.dailyUsed}/{info.dailyLimit} today</span><div style={{flex:1,height:"3px",background:C.border,borderRadius:"2px"}}><div style={{width:`${pct}%`,height:"100%",background:pct>80?C.warn:C.pink,borderRadius:"2px"}}/></div></>}
      {!info.canSend&&<span style={{color:C.warn,fontWeight:700,marginLeft:"auto"}}>LIMIT REACHED</span>}
    </div>
  );
}

function Bubble({ msg }: { msg: Message }) {
  const u = msg.role === "user";
  return (
    <div style={{display:"flex",justifyContent:u?"flex-end":"flex-start",marginBottom:"14px"}}>
      {!u&&<div style={{width:"28px",height:"28px",borderRadius:"50%",background:C.pinkDim,border:`1px solid ${C.pinkBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:900,color:C.pink,flexShrink:0,marginRight:"10px",alignSelf:"flex-end"}}>A</div>}
      <div style={{maxWidth:"72%",background:u?C.pinkDim:C.surface,border:`1px solid ${u?C.pinkBorder:C.border}`,borderRadius:u?"12px 12px 2px 12px":"12px 12px 12px 2px",padding:"12px 16px",fontSize:"13px",color:C.text,lineHeight:1.7}}>
        {msg.streaming&&!msg.content?<span style={{color:C.muted,fontStyle:"italic"}}>typing...</span>:msg.content}
        {msg.streaming&&msg.content&&<span style={{display:"inline-block",width:"8px",height:"13px",background:C.pink,marginLeft:"2px",animation:"blink 1s step-end infinite",verticalAlign:"text-bottom"}}/>}
      </div>
    </div>
  );
}

function InputBar({ onSend, disabled, loading }: { onSend:(t:string)=>void; disabled:boolean; loading:boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const go  = () => { const v = ref.current?.value.trim()??""; if(!v||disabled) return; if(ref.current) ref.current.value=""; onSend(v); };
  return (
    <div style={{borderTop:`1px solid ${C.border}`,padding:"14px 20px",display:"flex",gap:"10px",alignItems:"flex-end",background:C.bg,position:"sticky",bottom:0}}>
      <textarea ref={ref} disabled={disabled} rows={1}
        placeholder={disabled?"Insufficient tokens — upgrade your plan":"Message Aura8..."}
        onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();go();}}}
        style={{flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"11px 14px",color:disabled?C.muted:C.text,fontSize:"13px",fontFamily:C.font,outline:"none",resize:"none",lineHeight:1.5,minHeight:"44px",maxHeight:"120px"}}
      />
      <button onClick={go} disabled={disabled||loading}
        style={{background:disabled||loading?"#333":C.pink,border:"none",borderRadius:"8px",padding:"11px 18px",color:C.white,fontSize:"12px",fontWeight:700,cursor:disabled||loading?"not-allowed":"pointer",fontFamily:C.font,letterSpacing:"0.05em",minWidth:"68px"}}>
        {loading?"···":"SEND"}
      </button>
    </div>
  );
}

export default function ChatInterface() {
  const { messages, tokenInfo, isLoading, isLoadingHistory, error, sendMessage, clearError } = useConversation();
  const btm = useRef<HTMLDivElement>(null);
  useEffect(()=>{ btm.current?.scrollIntoView({ behavior:"smooth" }); },[messages]);

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",background:C.bg,fontFamily:C.font}}>
      {tokenInfo&&<TokenBar info={tokenInfo}/>}
      <div style={{flex:1,overflowY:"auto",padding:"24px 20px"}}>
        {isLoadingHistory&&<div style={{textAlign:"center",color:C.muted,fontSize:"11px",padding:"48px 0"}}>Loading conversation...</div>}
        {!isLoadingHistory&&messages.length===0&&(
          <div style={{textAlign:"center",color:C.faint,fontSize:"12px",padding:"60px 0",lineHeight:2}}>
            <div style={{fontSize:"28px",marginBottom:"12px"}}>✦</div>
            <div style={{color:C.pink,letterSpacing:"0.12em",marginBottom:"8px"}}>AURA8</div>
            <div>Your AI companion is ready.</div>
            <div style={{color:C.dimmer,marginTop:"4px"}}>Say hello to begin.</div>
          </div>
        )}
        {messages.map(m=><Bubble key={m.id} msg={m}/>)}
        <div ref={btm}/>
      </div>
      {error&&(
        <div style={{margin:"0 20px 8px",background:C.errorBg,border:`1px solid ${C.error}40`,borderRadius:"6px",padding:"10px 14px",fontSize:"11px",color:C.error,display:"flex",justifyContent:"space-between"}}>
          <span>{error}</span>
          <button onClick={clearError} style={{background:"none",border:"none",color:C.error,cursor:"pointer",fontFamily:C.font,fontSize:"11px",padding:0,marginLeft:"12px"}}>✕</button>
        </div>
      )}
      <InputBar onSend={sendMessage} disabled={!!(tokenInfo&&!tokenInfo.canSend)} loading={isLoading}/>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </div>
  );
}

