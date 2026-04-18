import { Badge } from "@/components/ui/badge"
import { Dot } from "lucide-react"

const LiveBadge = () => {
    return (
        <Badge
            className="bg-glass-bg border-glass-border py-1 px-3 shadow-md backdrop-blur-lg"
        >
            <div className="relative">
                <Dot className="size-1 bg-status-error aspect-square text-status-error rounded-full m-1" />
                <div className="bg-status-error/10 rounded-full absolute inset-0 size-3" />
                <div className="bg-status-error/10 rounded-full absolute inset-0 size-3 animate-ping" />
            </div>
            <span className="text-status-error">Live Now</span>
        </Badge>
    )
}

export default LiveBadge
