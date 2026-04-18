import { Badge } from "@/components/ui/badge";
import { cn, getCurrencyIcon } from "@/lib/utils";

const PriceBadge = ({ price, currency, isAbsolute = true }: { price: number; currency: string, isAbsolute?: boolean }) => {
    const icon = getCurrencyIcon(currency);

    return (
        <Badge
            className={cn("border border-glass-border shadow-md backdrop-blur-lg",
                isAbsolute ? "absolute z-999 top-2 right-2 py-3 px-5 text-sm bg-[#000000]/30" : "py-1 px-3 bg-glass-bg"
            )}
        >
            {/* <icon className="size-4" /> */}
            <span className="text-foreground">
                {price ? `${price}` : "Free"}
            </span>
        </Badge>
    )
}

export default PriceBadge
