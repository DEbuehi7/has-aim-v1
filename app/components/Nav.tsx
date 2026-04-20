'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const LINKS = [
{ href: '/dashboard', label: 'SENTINEL', color: '#00E5FF' },
{ href: '/deals', label: 'PIPELINE B', color: '#2ECC71' },
{ href: '/alerts', label: 'ALERTS', color: '#FF3C6E' },
{ href: '/grants', label: 'GRANTS', color: '#FFD700' },
{ href: '/field', label: 'FIELD OPS', color: '#F4A261' },
];

export default function Nav() {
const path = usePathname();
return (
<div style={{
background: '#04040A', borderBottom: '1px solid #1A1A2E',
padding: '0 20px', display: 'flex', alignItems: 'center',
height: 36, position: 'sticky', top: 0, zIndex: 100,
fontFamily: "'Courier New', monospace"
}}>
<Link href="/dashboard" style={{ textDecoration: 'none', marginRight: 24 }}>
<span style={{ fontSize: 11, fontWeight: 900, color: '#F0F0FA', letterSpacing: '0.08em' }}>
AIM <span style={{ color: '#00E5FF' }}>OS</span>
</span>
</Link>
<div style={{ display: 'flex', gap: 0, flex: 1 }}>
{LINKS.map(link => {
const active = path === link.href;
return (
<Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
<div style={{
padding: '0 14px', height: 36, display: 'flex', alignItems: 'center',
borderBottom: `2px solid ${active ? link.color : 'transparent'}`,
color: active ? link.color : '#484860',
fontSize: 8, letterSpacing: '0.14em', cursor: 'pointer',
transition: 'all 0.15s'
}}>
{link.label}
</div>
</Link>
);
})}
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
<div style={{ width: 5, height: 5, borderRadius: '50%', background: '#2ECC71', boxShadow: '0 0 5px #2ECC71' }} />
<span style={{ fontSize: 7, color: '#484860', letterSpacing: '0.14em' }}>aim2030app.com</span>
</div>
</div>
);
}
