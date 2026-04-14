import { Badge } from "@/components/ui/badge"
import { Dot } from "lucide-react"

const UpcomingBadge = () => {
    return (
        <Badge
            className="bg-glass-bg border-glass-border py-1 px-3 shadow-md backdrop-blur-lg"
        >
            <div className="relative">
                <Dot className="size-1 bg-status-info aspect-square text-status-info rounded-full m-1" />
                <div className="bg-status-info/10 rounded-full absolute inset-0 size-3" />
            </div>
            <span className="text-status-info">Upcoming</span>
        </Badge>
    )
}

export default UpcomingBadge
