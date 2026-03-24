import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HERMES EXPRESS — Create, Share & Remember",
  description: "Build beautiful memory canvases with photos, notes, doodles & voice messages. Share them with anyone, anywhere.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased noise`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
