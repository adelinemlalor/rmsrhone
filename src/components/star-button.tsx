import { Star } from "lucide-react";
import { toast } from "sonner";
import { useMyStars, useToggleStar } from "@/lib/data";
import { cn } from "@/lib/utils";

export function StarButton({
  itemId,
  className,
  withLabel = false,
}: {
  itemId: string;
  className?: string;
  withLabel?: boolean;
}) {
  const { data: stars } = useMyStars();
  const toggle = useToggleStar();
  const starred = stars?.has(itemId) ?? false;
  return (
    <button
      type="button"
      aria-pressed={starred}
      aria-label={starred ? "Unstar this plan" : "Star this plan"}
      title={starred ? "Starred — click to unstar" : "Star this plan"}
      onClick={(e) => {
        e.stopPropagation();
        toggle.mutate(
          { itemId, starred },
          { onError: () => toast.error("Couldn't update the star. Try again.") },
        );
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full transition-colors",
        withLabel
          ? "border border-border px-4 py-2 text-[13px] font-bold"
          : "grid size-8 place-items-center bg-cream/90",
        starred ? "text-amber-500" : "text-ink/40 hover:text-amber-500",
        className,
      )}
    >
      <Star className="size-4" fill={starred ? "currentColor" : "none"} />
      {withLabel ? (starred ? "Starred" : "Star") : null}
    </button>
  );
}
