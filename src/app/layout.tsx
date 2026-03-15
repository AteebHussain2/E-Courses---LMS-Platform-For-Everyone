import type { Metadata } from "next";
import "./globals.css";
import AppProviders from "@/components/providers/app-providers";

export const metadata: Metadata = {
  title: "ECourses - Home",
  description: "A platform for online courses and learning resources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
