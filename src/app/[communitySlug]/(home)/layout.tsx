import HomeSidebar from "@/components/sidebar/HomeSidebar";
import type { Metadata } from "next";

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
        <div className="max-h-screen pt-3 flex flex-row flex-1 items-center justify-center">
            <HomeSidebar slug="pak-tech" name="Pak Tech" />
            <main className="overflow-y-auto scroll-m-0 bg-background w-full h-full border border-border rounded-t-[20px] mx-3">
                {children}
            </main>
        </div>
    );
}
