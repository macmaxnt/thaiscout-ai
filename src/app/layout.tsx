import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThaiScout AI · Location intelligence for production teams",
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
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display:ital@0;1&family=Mitr:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
