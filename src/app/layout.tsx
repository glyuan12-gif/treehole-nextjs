import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "树洞 - 匿名社交平台",
  description: "一个温暖的匿名社交平台，在这里你可以自由表达真实的自己",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <ToastProvider>
            {/* Background decorations */}
            <div className="bg-decor">
              <div className="bg-orb" />
              <div className="bg-orb" />
              <div className="bg-orb" />
            </div>
            <div className="bg-grain" />
            <div className="bg-pattern" />

            {/* Navigation */}
            <Navbar />

            {/* Main content */}
            {children}

            {/* Mobile bottom navigation */}
            <BottomNav />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
