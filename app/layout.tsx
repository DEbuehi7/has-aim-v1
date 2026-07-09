import type { Metadata } from "next";
import "./globals.css";
import Nav from "./components/Nav";
import PureChat from "./components/PureChat";

export const metadata: Metadata = {
  title: "AIM OS · HAS Sentinel",
  description: "Housing Autonomy System — Context Provider for Real Estate Reality",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#04040A" }}>
        <Nav />
        {children}
        <PureChat />
        <div style={{
          background: "#04040A",
          borderTop: "1px solid #1A1A2E",
          padding: "10px 24px",
          textAlign: "center",
          fontSize: "9px",
          color: "#2A2A3A",
          letterSpacing: "0.1em",
          fontFamily: "DM Mono, monospace",
        }}>
          AIM OS&#8482; &middot; HAS Sentinel&#8482; &middot; AIMedia Pulse&#8482; &middot; Aura8&#8482; &middot; AIMoney&#8482; &middot; Pure&#8482;
          &nbsp;&nbsp;&copy; 2026 Smiling Bubbles Inc. All rights reserved.
        </div>
      </body>
    </html>
  );
}
