import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ButtonProps = {
    className?: string,
    disabled?: boolean,
}

export const SessionAddButton = ({ className, disabled = false }: ButtonProps) => {
    return (
        <Button
            size='lg'
            className={cn("w-full cursor-pointer rounded-full text-foreground hover:text-foreground", className)}
            disabled={disabled}
        >
            <Link href="sessions/add" className='w-full h-full items-center justify-center flex gap-2'>
                <Plus /> Add Session
            </Link>
        </Button>
    )
}