import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIAT x CAMT · ThaiScout AI Lab",
  description: "ระบบค้นหาโลเคชันถ่ายทำ และข้อมูลติดต่อขอใบอนุญาตสำหรับกองถ่าย ครีเอเตอร์ จากฐานข้อมูล ททท.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Mitr:wght@400;500;600;700&family=Nunito:wght@600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
