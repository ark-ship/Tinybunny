import type { Metadata } from "next";
import "./globals.css"; // <--- INI KUNCI UTAMANYA. JANGAN SAMPAI HILANG.

export const metadata: Metadata = {
  title: "Tiny Bunny | MegaETH",
  description: "Fast Hop. No Stop.",
  icons: {
    icon: "/bunny.png", // Ini buat paksa browser pake file bunny.png lo sebagai icon tab
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}