"use client";

import { TopbarBackButton, TopbarNotificationButton, TopbarSettingsButton, TopbarUserButton } from "./TopbarButtons";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { ModeToggle } from "../providers/theme-toggle";
import { ArrowLeft, SearchIcon } from "lucide-react";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";

const CourseTopbar = ({ communitySlug, courseSlug }: { communitySlug: string, courseSlug: string }) => {
    const { setOpen } = useSidebar()

    return (
        <div className="pt-3 bg-sidebar z-50 sticky top-0 left-0 right-0">
            <header className="bg-background flex items-center justify-between px-10 w-full h-17.5 rounded-t-[20px] border-border border border-b-0!">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="cursor-pointer text-secondary" variant='ghost' />

                    <InputGroup
                        className="rounded-[8px]! min-h-10.5 bg-glass-bg! gap-5! px-3! py-2! max-w-75 has-[[data-slot=input-group-control]:focus-visible]:border-border-focus has-[[data-slot=input-group-control]:focus-visible]:ring-0!"
                    >
                        <InputGroupAddon className="p-0!">
                            <SearchIcon className="size-4.5!" />
                        </InputGroupAddon>
                        <InputGroupInput
                            placeholder="Search sessions, courses..."
                            type="text"
                            id="search"
                            name="search"
                            className="p-0!"
                        />
                    </InputGroup>
                </div>

                <div className="px-6 py-1 rounded-full flex items-center gap-2">
                    <ModeToggle />
                    <TopbarNotificationButton />
                    <TopbarSettingsButton />
                    {/* <TopbarUserButton /> */}
                </div>
            </header>
        </div>
    )
}

export default CourseTopbar
