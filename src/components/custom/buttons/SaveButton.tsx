import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";

type SaveButtonProps = {
    isSession: boolean
}

const SaveButton = ({ isSession }: SaveButtonProps) => {
    const secondaryLabel = "Save in Library" // isSession ? "Save in Library" : "Save in Library"

    return (
        <Button
            variant='ghost'
            className="h-full w-full inline-flex flex-1 items-center gap-2 px-4 py-3 rounded-full text-sm font-medium cursor-pointer"
            onClick={() => toast.info("TODO: Implement save in courses")}
        >
            <Bookmark className="size-4" />
            {secondaryLabel}
        </Button>
    )
}

export default SaveButton
