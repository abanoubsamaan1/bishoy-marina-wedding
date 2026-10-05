import type { CSSProperties } from "react";
import { focusAt, photoAt, sizeAt } from "../lib/photos";
import { cn } from "../utils/cn";

type Props = {
  i: number;
  className?: string;
  style?: CSSProperties;
  pos?: string;
  eager?: boolean;
  alt?: string;
};

/** Displays the couple's real photograph untouched. If no photo has been supplied yet,
 *  an elegant monogram plate is shown instead (never a generated face). */
export function Photo({ i, className, style, pos, eager, alt = "Bishoy and Marina" }: Props) {
  const src = photoAt(i);
  if (!src) {
    return (
      <div
        className={cn("relative grid place-items-center overflow-hidden", className)}
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, #3b2a16 0%, #1b130b 55%, #0b0806 100%)",
          ...style,
        }}
        role="img"
        aria-label={alt}
      >
        <span className="font-serif italic text-[#d9b873]/60 text-[clamp(2rem,9vw,4.5rem)] tracking-widest">
          B &amp; M
        </span>
      </div>
    );
  }
  const nat = sizeAt(i);
  return (
    <img
      src={src}
      alt={alt}
      width={nat.w}
      height={nat.h}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
      draggable={false}
      className={cn("object-cover", className)}
      style={{ objectPosition: pos ?? focusAt(i), ...style }}
    />
  );
}
