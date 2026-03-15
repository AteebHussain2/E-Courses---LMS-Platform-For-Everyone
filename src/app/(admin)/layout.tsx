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
        <div>
            <main>
                {children}
            </main>
        </div>
    );
}
