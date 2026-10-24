import React, { useEffect, useRef, useState } from "react";

/**
 * Decorative cursor follower.
 * Fixes: it re-rendered React on every mousemove (state per pixel), and its fill used an
 * undefined colour token so it was fully transparent (invisible) in practice.
 * Now it moves via a ref + requestAnimationFrame, uses a real colour, and is disabled for
 * touch devices and for users who prefer reduced motion.
 */
export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);

    let raf = 0;
    let x = -100;
    let y = -100;
    const paint = () => {
      raf = 0;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };
    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      setHovering(!!el?.closest("a, button, [role='button'], summary, label, select"));
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;
  return (
    <div
      ref={dot}
      aria-hidden="true"
      className={`fixed top-0 left-0 w-4 h-4 rounded-full pointer-events-none z-[9999] bg-white mix-blend-difference transition-[width,height,opacity] duration-200 ${
        hovering ? "w-8 h-8 opacity-60" : "opacity-90"
      }`}
    />
  );
}
