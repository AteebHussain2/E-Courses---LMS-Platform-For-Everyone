import type { Metadata } from "next";
import "./globals.css";
import { DM_Sans, Plus_Jakarta_Sans, Inder, DM_Mono } from 'next/font/google';
import AppProviders from "@/components/providers/app-providers";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "ECourses - Home",
  description: "A platform for online courses and learning resources.",
};

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  weight: "variable",
  preload: true,
  subsets: ["latin", "latin-ext"],
  display: "swap",
})

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["300", "400", "500"],
  preload: true,
  subsets: ["latin", "latin-ext"],
  display: "swap",
})

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  weight: "variable",
  preload: true,
  subsets: ["latin", "latin-ext"],
  display: "block",
})
const inder = Inder({
  variable: "--font-font-inder",
  weight: "400",
  preload: false,
  subsets: ["latin", "latin-ext"],
  display: "optional",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`bg-sidebar ${dmSans.variable} ${inder.variable} ${plusJakartaSans.variable} ${dmMono.variable}`}>
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html >
  );
}
