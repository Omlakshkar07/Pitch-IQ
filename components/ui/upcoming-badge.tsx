import { cn } from "@/lib/utils";

interface UpcomingBadgeProps {
    className?: string;
}

export function UpcomingBadge({ className }: UpcomingBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full bg-amber-100/80 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
                className
            )}
        >
            COMING SOON
        </span>
    );
}
