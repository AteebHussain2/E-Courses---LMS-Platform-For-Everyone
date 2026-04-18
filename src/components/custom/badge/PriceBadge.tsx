import { Badge } from "@/components/ui/badge";
import { getCurrencyIcon } from "@/lib/utils";

const PriceBadge = ({ price, currency }: { price: number; currency: string }) => {
    const icon = getCurrencyIcon(currency);
    return (
        <Badge
            className="absolute top-2 right-2 bg-[#000000]/30 border border-glass-border py-3! px-5 shadow-md backdrop-blur-lg text-sm"
        >
            {/* <icon className="size-4" /> */}
            <span className="text-foreground">
                {price ? `${price}` : "Free"}
            </span>
        </Badge>
    )
}

export default PriceBadge
