export default function Privacy() {
    return (
    <div style={{ background: '#04040A', minHeight: '100vh', color: '#F0F0FA',
    fontFamily: "'Courier New', monospace", padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
    <h1 style={{ fontSize: 24, fontWeight: 900, color: '#00E5FF', marginBottom: 8 }}>Privacy Policy</h1>
    <p style={{ fontSize: 10, color: '#484860', marginBottom: 32 }}>Last updated: April 2026</p>
    {[
    ['Data We Collect', 'We collect property address, contact information, and communication preferences voluntarily submitted by property owners through our platform at aim2030app.com.'],
    ['How We Use Data', 'Information is used solely to facilitate real estate consultations and communications between property owners and licensed real estate professionals affiliated with SBI Capital and Keller Williams SELA.'],
    ['SMS Communications', 'By submitting your information, you consent to receive SMS messages regarding your property. Message and data rates may apply. Message frequency varies. Reply STOP to opt out at any time. Reply HELP for assistance.'],
    ['Data Sharing', 'We do not sell, trade, or share your personal information with third parties for marketing purposes. Information may be shared with licensed real estate professionals directly involved in your transaction.'],
    ['Data Security', 'All data is stored securely using industry-standard encryption. We use Supabase for data storage with row-level security enabled on all tables.'],
    ['Opt-Out', 'You may opt out of SMS communications at any time by replying STOP to any message. You may request deletion of your data by emailing EDOAIM2030@pm.me.'],
    ['Contact', 'Daniel Ebuehi | SBI Capital | EDOAIM2030@pm.me | (323) 689-4495 | CA RE #02224369'],
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
    