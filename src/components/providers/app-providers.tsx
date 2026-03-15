"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from "./theme-provider";
import { TooltipProvider } from "../ui/tooltip";
import { ClerkProvider } from "@clerk/nextjs";
import { useState } from "react";

const AppProviders = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <ClerkProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <QueryClientProvider client={queryClient}>
                    <TooltipProvider>
                        {children}
                    </TooltipProvider>
                    <ReactQueryDevtools initialIsOpen={false} />
                </QueryClientProvider>
            </ThemeProvider>
        </ClerkProvider>
    )
}

export default AppProviders
