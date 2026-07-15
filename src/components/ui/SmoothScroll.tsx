import React, { useEffect, useRef } from "react";
import Lenis from "lenis";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    const handleCustomScroll = (e: CustomEvent) => {
      const top = e.detail?.top ?? 0;
      const immediate = e.detail?.immediate ?? true;
      lenis.scrollTo(top, { immediate });
    };
    window.addEventListener('lenis-scroll-to', handleCustomScroll as EventListener);

    return () => {
      window.removeEventListener('lenis-scroll-to', handleCustomScroll as EventListener);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
