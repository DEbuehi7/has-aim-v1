export default function Terms() {
    return (
    <div style={{ background: '#04040A', minHeight: '100vh', color: '#F0F0FA',
    fontFamily: "'Courier New', monospace", padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
    <h1 style={{ fontSize: 24, fontWeight: 900, color: '#00E5FF', marginBottom: 8 }}>Terms and Conditions</h1>
    <p style={{ fontSize: 10, color: '#484860', marginBottom: 32 }}>Last updated: April 2026</p>
    {[
    ['Program Name', 'HAS Sentinel — Real Estate Outreach Program operated by SBI Capital / Smiling Bubbles Inc.'],
    ['Program Description', 'SMS communications sent by licensed real estate professionals to property owners who have expressed interest in selling or exploring property management solutions in Southeast Los Angeles.'],
    ['Message Frequency', 'Message frequency varies based on your property status and consultation stage. Typically 1-3 messages per month.'],
    ['Message & Data Rates', 'Message and data rates may apply. Contact your wireless carrier for details about your plan.'],
    ['Opt-Out Instructions', 'Reply STOP to any message to unsubscribe immediately. You will receive one confirmation message. No further messages will be sent.'],
    ['Help', 'Reply HELP to any message for assistance or contact us at EDOAIM2030@pm.me or (323) 689-4495.'],
    ['Support Contact', 'Daniel Ebuehi | SBI Capital | EDOAIM2030@pm.me | (323) 689-4495 | CA RE #02224369 | KW SELA'],
    ['Governing Law', 'These terms are governed by the laws of the State of California. All real estate activities conducted under CA RE License #02224369.'],
    ].map(([title, content]) => (
    <div key={title} style={{ marginBottom: 24, padding: '16px', background: '#080812',
    border: '1px solid #1A1A2E', borderLeft: '3px solid #00E5FF', borderRadius: 4 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: '#00E5FF',
    letterSpacing: '0.12em', marginBottom: 8 }}>{title}</div>
    <div style={{ fontSize: 11, color: '#C0C0D8', lineHeight: 1.8 }}>{content}</div>
    </div>
    ))}
    </div>
    );
    }