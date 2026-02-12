import React, { useCallback } from "react";
import PixelCanvas from "./PixelCanvas";

const LOGICAL_W = 320;
const LOGICAL_H = 180;

function clamp01(x) {
    return Math.max(0, Math.min(1, x));
}

export default function IslandScene({ waterLevel = 0 }) {
    const draw = useCallback(
        (ctx, w, h) => {
            // ==========================
            // SKY
            // ==========================
            ctx.fillStyle = "#87cfff";
            ctx.fillRect(0, 0, w, h);

            // Clouds
            ctx.fillStyle = "#bfe9ff";
            const clouds = [
                [40, 30],
                [100, 20],
                [180, 35],
                [240, 25],
            ];

            clouds.forEach(([x, y]) => {
                ctx.fillRect(x, y, 30, 6);
                ctx.fillRect(x + 8, y - 5, 20, 6);
                ctx.fillRect(x + 4, y + 5, 25, 4);
            });

            // ==========================
            // OCEAN
            // ==========================
            const oceanTop = Math.floor(h * 0.55);

            ctx.fillStyle = "#2a6db0";
            ctx.fillRect(0, oceanTop, w, h - oceanTop);

            ctx.fillStyle = "#1e4f85";
            for (let y = oceanTop; y < h; y += 4) {
                ctx.fillRect(0, y, w, 2);
            }

            // ==========================
            // BIG ISLAND (ellipse)
            // ==========================
            const islandCenterX = w / 2;
            const islandCenterY = oceanTop - 20;

            const radiusX = 110;  // width of island
            const radiusY = 35;   // height of island

            for (let y = -radiusY; y <= radiusY; y++) {
                const widthFactor = Math.sqrt(1 - (y * y) / (radiusY * radiusY));
                const halfWidth = radiusX * widthFactor;

                const startX = Math.floor(islandCenterX - halfWidth);
                const endX = Math.floor(islandCenterX + halfWidth);

                // Outline
                ctx.fillStyle = "#6f4a1f";
                ctx.fillRect(startX - 1, islandCenterY + y, endX - startX + 2, 1);

                // Fill
                ctx.fillStyle = "#d9b382";
                ctx.fillRect(startX, islandCenterY + y, endX - startX, 1);
            }

            // Bottom cliff shading
            ctx.fillStyle = "#b57f4f";
            ctx.fillRect(
                islandCenterX - radiusX + 10,
                islandCenterY + radiusY - 6,
                radiusX * 2 - 20,
                6
            );

            // Shore foam
            ctx.fillStyle = "#cfefff";
            ctx.fillRect(
                islandCenterX - radiusX + 12,
                islandCenterY + radiusY + 1,
                radiusX * 2 - 24,
                2
            );

            // ==========================
            // HOUSE (left side)
            // ==========================
            const houseX = islandCenterX - 60;
            const houseY = islandCenterY - 25;

            // Roof
            ctx.fillStyle = "#c0392b";
            ctx.fillRect(houseX, houseY, 30, 10);

            // Walls
            ctx.fillStyle = "#f2f2f2";
            ctx.fillRect(houseX + 3, houseY + 10, 24, 20);

            // Door
            ctx.fillStyle = "#7a4b20";
            ctx.fillRect(houseX + 12, houseY + 18, 6, 12);

            // House outline
            ctx.fillStyle = "#2b2b2b";
            ctx.fillRect(houseX + 27, houseY + 10, 3, 20);
            ctx.fillRect(houseX + 3, houseY + 30, 27, 3);

            // ==========================
            // FACTORY (right side)
            // ==========================
            const fx = islandCenterX + 40;
            const fy = islandCenterY - 20;

            ctx.fillStyle = "#5a5a5a";
            ctx.fillRect(fx, fy + 15, 40, 25);

            ctx.fillStyle = "#2f2f2f";
            ctx.fillRect(fx + 28, fy - 5, 8, 25); // chimney

            // Smoke
            ctx.fillStyle = "#bdbdbd";
            ctx.fillRect(fx + 24, fy - 15, 15, 6);
            ctx.fillRect(fx + 30, fy - 20, 15, 6);

            // ==========================
            // RISING WATER OVERLAY
            // ==========================
            const level = clamp01(waterLevel);
            const maxRise = 50;
            const rise = Math.floor(level * maxRise);

            if (rise > 0) {
                ctx.fillStyle = "#2a6db0";
                ctx.fillRect(0, h - rise, w, rise);

                ctx.fillStyle = "#1e4f85";
                for (let y = h - rise; y < h; y += 4) {
                    ctx.fillRect(0, y, w, 2);
                }
            }
        },
        [waterLevel]
    );

    return (
        <div className="pixelStage">
            <PixelCanvas
                width={LOGICAL_W}
                height={LOGICAL_H}
                draw={draw}
                className="pixelCanvas"
            />
        </div>
    );
}
