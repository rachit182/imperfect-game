import { useEffect, useRef } from "react";

export default function PixelCanvas({ width, height, draw, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || typeof draw !== "function") return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);
    draw(ctx, width, height);
  }, [width, height, draw]);

  return <canvas ref={ref} className={className} />;
}
