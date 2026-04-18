import { Badge } from "@/components/ui/badge";
import { Dot } from "lucide-react";

const NewBadge = () => {
    return (
        <Badge
            className="bg-glass-bg border border-glass-border py-1 px-3 shadow-md backdrop-blur-lg"
        >
            <div className="relative">
                <Dot className="size-1 bg-status-success aspect-square text-status-success rounded-full m-1" />
                <div className="bg-status-success/10 rounded-full absolute inset-0 size-3" />
                <div className="bg-status-success/10 rounded-full absolute inset-0 size-3 animate-ping" />
            </div>
            <span className="text-status-success">New</span>
        </Badge>
    )
}

export default NewBadge
