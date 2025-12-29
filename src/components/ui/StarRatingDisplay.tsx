import { FaStar } from "react-icons/fa";
import { cn } from "@/utils/cn";

type StarRatingDisplayProps = {
  value: number;
  max?: number;
  size?: number;
  className?: string;
};

export default function StarRatingDisplay({
  value,
  max = 5,
  size = 14,
  className,
}: StarRatingDisplayProps) {
  const clamped = Number.isFinite(value) ? Math.min(Math.max(value, 0), max) : 0;

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      aria-label={`Nivel ${clamped}/${max}`}
    >
      {Array.from({ length: max }).map((_, index) => {
        const starIndex = index + 1;
        const fill = Math.min(1, Math.max(0, clamped - (starIndex - 1)));
        return (
          <span
            key={`star-${starIndex}`}
            className="relative inline-flex"
            style={{ width: size, height: size }}
            aria-hidden="true"
          >
            <FaStar size={size} className="text-zinc-600" />
            {fill > 0 && (
              <span
                className="absolute left-0 top-0 overflow-hidden"
                style={{ width: `${fill * 100}%`, height: size }}
              >
                <FaStar size={size} className="text-yellow-400" />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
