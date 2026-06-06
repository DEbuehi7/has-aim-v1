"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";

const CRUSHON_LINK = "https://crushon.ai/?ref=mtk1mdd&mist=1";

const DEMO_USER = {
  email: "reviewer@ccbill.com",
  name: "CCBill Reviewer",
  tier: "Solace8",
  joined: "June 2026",
};

const COMPANIONS = [
  {
    id: 1,
    name: "Aria",
    age: 25,
    personality: "Warm, intellectually curious, emotionally supportive",
    interests: "Philosophy, jazz, long conversations about life",
    preview: "Hi there. I was hoping you would visit today...",
    color: "#FF006E",
  },
  {
    id: 2,
    name: "Nova",
    age: 28,
    personality: "Playful, witty, adventurous",
    interests: "Travel, poetry, late night talks",
    preview: "You caught me thinking about you...",
    color: "#8B5CF6",
  },
  {
    id: 3,
    name: "Sage",
    age: 32,
