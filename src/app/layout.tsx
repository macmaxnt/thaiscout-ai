import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThaiScout AI — Intelligent Location Scouting & Permit Assistant",
  description: "ระบบค้นหาโลเคชันถ่ายทำ และข้อมูลติดต่อขอใบอนุญาตสำหรับกองถ่าย ครีเอเตอร์ และโปรดักชั่น จากฐานข้อมูล ททท.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="dark">
      <body className="min-h-screen bg-[#0a0d14] text-slate-100 antialiased selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
