import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { QAFeedback } from "@/components/qa-feedback"; 
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SSI Info Hub",
  description: "Internal knowledge base for Strategic Synergy Inc.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          {/* This makes it appear on every page automatically */}
          <QAFeedback /> 
        </ThemeProvider>
      </body>
    </html>
  );
}