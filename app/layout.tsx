import type { Metadata } from "next";
import Nav from "./components/Nav";

export const metadata: Metadata = {
title: "AIM OS · HAS Sentinel",
description: "Housing Autonomy System — Context Provider for Real Estate Reality",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="en">
<body style={{ margin: 0, padding: 0, background: '#04040A' }}>
<Nav />
{children}
</body>
</html>
);
}