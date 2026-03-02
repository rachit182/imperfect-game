import React, { useEffect, useRef } from "react";

/**
 * PixelCanvas
 * Renders at a logical resolution (width x height) and scales crisply to fit parent.
 */
export default function PixelCanvas({ width, height, draw, className }) {
    const ref = useRef(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;

        if (typeof draw !== "function") {
            console.error("PixelCanvas: draw prop must be a function. Got:", draw);
            return;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, width, height);

        draw(ctx, width, height);
    }, [width, height, draw]);

    return (
        <canvas
            ref={ref}
            className={className}
            style={{
                width: "100%",
                height: "100%",
                display: "block",
                imageRendering: "pixelated",
            }}
        />
    );
}
