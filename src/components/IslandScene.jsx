import React, { useCallback } from "react";
import PixelCanvas from "./PixelCanvas";

const LOGICAL_W = 320;
const LOGICAL_H = 180;
const TILE = 8;

function clamp01(x) {
    return Math.max(0, Math.min(1, x));
}

function key(gx, gy) {
    return `${gx},${gy}`;
}

function parseKey(k) {
    const [x, y] = k.split(",").map(Number);
    return { x, y };
}

function rand01(seed) {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
}

function neighbors8(gx, gy) {
    return [
        [gx + 1, gy],
        [gx - 1, gy],
        [gx, gy + 1],
        [gx, gy - 1],
        [gx + 1, gy + 1],
        [gx - 1, gy - 1],
        [gx + 1, gy - 1],
        [gx - 1, gy + 1],
    ];
}

function drawOutlinedRect(ctx, x, y, w, h, fill, outline) {
    ctx.fillStyle = outline;
    ctx.fillRect(x - 1, y, 1, h);
    ctx.fillRect(x + w, y, 1, h);
    ctx.fillRect(x, y - 1, w, 1);
    ctx.fillRect(x, y + h, w, 1);

    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
}

export default function IslandScene({ waterLevel = 0 }) {
    const draw = useCallback(
        (ctx, w, h) => {
            // ==========================
            // PALETTE
            // ==========================
            const WATER_BANDS = [
                "#79c9ff",
                "#63befa",
                "#4fb2f4",
                "#3aa4ec",
                "#2d95e1",
                "#2684d2",
                "#1f73c1",
                "#1a64ad",
                "#155697",
            ];

            const SHORE_GLOW = "#aeeaff";
            const SHORE_GLOW2 = "#d6f6ff";

            const SAND = "#fff2c7";
            const SAND_SPECK = "#f1df9a";
            const SAND_DARK = "#ead89a";

            const GRASS = "#55c46f";
            const GRASS_DARK = "#43a85e";
            const GRASS_SPECK = "#66d580";

            const DIRT = "#8a5530";
            const DIRT_DARK = "#6e4124";

            const OUTLINE = "#1a1a1a";
            const FOAM = "#e9fbff";

            // House
            const HOUSE_WALL = "#f7f4ee";
            const HOUSE_ROOF = "#e14b3a";
            const HOUSE_ROOF_HI = "#f06152";
            const HOUSE_SHADOW = "#e3dfd7";
            const DOOR = "#7a4b20";
            const WINDOW = "#7fd8ff";
            const HOUSE_OUTLINE = "#111111";

            // Factory
            const FACTORY = "#6b6b6b";
            const FACTORY_HI = "#7c7c7c";
            const FACTORY_DARK = "#2f2f2f";
            const FACTORY_OUTLINE = "#111111";

            const SMOKE1 = "#d8d8d8";
            const SMOKE2 = "#bdbdbd";

            // ==========================
            // GRID
            // ==========================
            const gridW = Math.floor(w / TILE);
            const gridH = Math.floor(h / TILE);

            const px = (gx) => gx * TILE;
            const py = (gy) => gy * TILE;

            // ==========================
            // ISLAND SHAPE
            // ==========================
            const land = new Set();

            const c1 = { x: Math.floor(gridW * 0.42), y: Math.floor(gridH * 0.38) };
            const c2 = { x: Math.floor(gridW * 0.56), y: Math.floor(gridH * 0.43) };

            for (let gy = 0; gy < gridH; gy++) {
                for (let gx = 0; gx < gridW; gx++) {
                    const dx1 = (gx - c1.x) / 10.0;
                    const dy1 = (gy - c1.y) / 6.2;
                    const d1 = dx1 * dx1 + dy1 * dy1;

                    const dx2 = (gx - c2.x) / 8.6;
                    const dy2 = (gy - c2.y) / 5.6;
                    const d2 = dx2 * dx2 + dy2 * dy2;

                    const d = Math.min(d1, d2);

                    if (d <= 1.0) {
                        const edge = 1.0 - d;
                        const j = rand01(gx * 971 + gy * 113);
                        if (edge > 0.12 || j > 0.45) land.add(key(gx, gy));
                    }
                }
            }

            // carve bays
            const carve = [
                { x: c1.x - 8, y: c1.y + 3, r: 2 },
                { x: c2.x + 6, y: c2.y + 2, r: 2 },
                { x: c1.x + 1, y: c1.y - 6, r: 2 },
            ];
            for (const c of carve) {
                for (let gy = c.y - c.r; gy <= c.y + c.r; gy++) {
                    for (let gx = c.x - c.r; gx <= c.x + c.r; gx++) {
                        land.delete(key(gx, gy));
                    }
                }
            }

            // beach lobes
            const addLobes = [
                { x: c1.x - 10, y: c1.y - 1, r: 3 },
                { x: c1.x - 9, y: c1.y + 5, r: 3 },
                { x: c2.x + 9, y: c2.y - 1, r: 3 },
            ];
            for (const c of addLobes) {
                for (let gy = c.y - c.r; gy <= c.y + c.r; gy++) {
                    for (let gx = c.x - c.r; gx <= c.x + c.r; gx++) {
                        const dx = gx - c.x;
                        const dy = gy - c.y;
                        if (dx * dx + dy * dy <= c.r * c.r) land.add(key(gx, gy));
                    }
                }
            }

            const hasLand = (gx, gy) => land.has(key(gx, gy));

            // ==========================
            // BEACH vs GRASS
            // ==========================
            const beach = new Set();
            const grass = new Set();

            for (const k of land) {
                const { x: gx, y: gy } = parseKey(k);
                let waterAdj = 0;
                for (const [nx, ny] of neighbors8(gx, gy)) {
                    if (!hasLand(nx, ny)) waterAdj++;
                }
                if (waterAdj >= 2) beach.add(k);
                else grass.add(k);
            }

            // thicken beach ring
            const beach2 = new Set(beach);
            for (const k of beach) {
                const { x: gx, y: gy } = parseKey(k);
                for (const [nx, ny] of neighbors8(gx, gy)) {
                    const nk = key(nx, ny);
                    if (grass.has(nk) && rand01(nx * 91 + ny * 17) > 0.58) {
                        grass.delete(nk);
                        beach2.add(nk);
                    }
                }
            }
            beach.clear();
            for (const k of beach2) beach.add(k);

            // ==========================
            // HIGH PLATEAU (right side)
            // ==========================
            const high = new Set();
            const highCenter = { x: c2.x + 5, y: c2.y - 1 };

            for (const k of grass) {
                const { x: gx, y: gy } = parseKey(k);
                if (gx < c2.x + 2) continue;
                const dx = (gx - highCenter.x) / 4.8;
                const dy = (gy - highCenter.y) / 3.0;
                const d = dx * dx + dy * dy;
                if (d <= 1.0) high.add(k);
            }

            const hasHigh = (gx, gy) => high.has(key(gx, gy));

            // ==========================
            // WATER DISTANCE FIELD (radial)
            // ==========================
            const maxDist = 18;
            const distToLand = Array.from({ length: gridH }, () =>
                Array.from({ length: gridW }, () => Infinity)
            );

            const q = [];
            for (const k of land) {
                const { x: gx, y: gy } = parseKey(k);
                if (gx >= 0 && gx < gridW && gy >= 0 && gy < gridH) {
                    distToLand[gy][gx] = 0;
                    q.push([gx, gy]);
                }
            }

            const dirs4 = [
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
            ];

            while (q.length) {
                const [x, y] = q.shift();
                const d = distToLand[y][x];
                if (d >= maxDist) continue;

                for (const [dx, dy] of dirs4) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx < 0 || nx >= gridW || ny < 0 || ny >= gridH) continue;
                    if (distToLand[ny][nx] > d + 1) {
                        distToLand[ny][nx] = d + 1;
                        q.push([nx, ny]);
                    }
                }
            }

            // water
            for (let gy = 0; gy < gridH; gy++) {
                for (let gx = 0; gx < gridW; gx++) {
                    if (hasLand(gx, gy)) continue;

                    const d = distToLand[gy][gx];
                    const t = clamp01(d / maxDist);
                    const idx = Math.min(
                        WATER_BANDS.length - 1,
                        Math.floor(t * (WATER_BANDS.length - 1))
                    );

                    ctx.fillStyle = WATER_BANDS[idx];
                    ctx.fillRect(px(gx), py(gy), TILE, TILE);

                    const r = rand01(gx * 77 + gy * 131);
                    if (r > 0.935) {
                        ctx.fillStyle = "rgba(255,255,255,0.14)";
                        ctx.fillRect(px(gx) + 2, py(gy) + 2, 2, 2);
                    }
                }
            }

            // shore glow ring
            for (let gy = 0; gy < gridH; gy++) {
                for (let gx = 0; gx < gridW; gx++) {
                    if (hasLand(gx, gy)) continue;
                    const d = distToLand[gy][gx];
                    if (d === 1) {
                        ctx.fillStyle = SHORE_GLOW;
                        ctx.fillRect(px(gx), py(gy), TILE, TILE);
                        if (rand01(gx * 19 + gy * 23) > 0.72) {
                            ctx.fillStyle = SHORE_GLOW2;
                            ctx.fillRect(px(gx) + 2, py(gy) + 2, 4, 4);
                        }
                    }
                }
            }

            // ==========================
            // CLIFF INTO WATER
            // ==========================
            const lowCliffDepth = 10;

            for (const k of land) {
                const { x: gx, y: gy } = parseKey(k);
                if (!hasLand(gx, gy + 1)) {
                    ctx.fillStyle = DIRT;
                    ctx.fillRect(px(gx), py(gy) + TILE, TILE, lowCliffDepth);

                    ctx.fillStyle = DIRT_DARK;
                    ctx.fillRect(px(gx), py(gy) + TILE + lowCliffDepth - 2, TILE, 2);

                    if (rand01(gx * 41 + gy * 17) > 0.82) {
                        ctx.fillStyle = "rgba(255,255,255,0.28)";
                        ctx.fillRect(px(gx) + 2, py(gy) + TILE + 3, 1, 1);
                    }
                }
            }

            // contact shadow under cliff
            ctx.fillStyle = "rgba(0,0,0,0.22)";
            for (const k of land) {
                const { x: gx, y: gy } = parseKey(k);
                if (hasLand(gx, gy + 1)) continue;
                const sx = px(gx);
                const sy = py(gy) + TILE + lowCliffDepth;
                ctx.fillRect(sx + 1, sy, TILE - 2, 2);
            }

            // ==========================
            // TOP SURFACE: BEACH + GRASS
            // ==========================
            for (const k of beach) {
                const { x: gx, y: gy } = parseKey(k);
                ctx.fillStyle = SAND;
                ctx.fillRect(px(gx), py(gy), TILE, TILE);

                if (rand01(gx * 21 + gy * 29) > 0.84) {
                    ctx.fillStyle = SAND_SPECK;
                    ctx.fillRect(px(gx) + 2, py(gy) + 2, 2, 2);
                }
            }

            for (const k of grass) {
                const { x: gx, y: gy } = parseKey(k);

                ctx.fillStyle = GRASS;
                ctx.fillRect(px(gx), py(gy), TILE, TILE);

                const r = rand01(gx * 19 + gy * 31);
                if (r > 0.79) {
                    ctx.fillStyle = GRASS_DARK;
                    ctx.fillRect(px(gx) + 1, py(gy) + TILE - 2, TILE - 2, 2);
                } else if (r > 0.71) {
                    ctx.fillStyle = GRASS_SPECK;
                    ctx.fillRect(px(gx) + 2, py(gy) + 2, 2, 2);
                }
            }

            // high plateau tint (subtle)
            for (const k of high) {
                const { x: gx, y: gy } = parseKey(k);
                ctx.fillStyle = "rgba(0,0,0,0.06)";
                ctx.fillRect(px(gx), py(gy), TILE, TILE);

                if (rand01(gx * 55 + gy * 12) > 0.83) {
                    ctx.fillStyle = "rgba(0,0,0,0.10)";
                    ctx.fillRect(px(gx) + 1, py(gy) + TILE - 2, TILE - 2, 2);
                }
            }

            // outline land
            for (const k of land) {
                const { x: gx, y: gy } = parseKey(k);
                ctx.fillStyle = OUTLINE;

                if (!hasLand(gx, gy - 1)) ctx.fillRect(px(gx), py(gy), TILE, 1);
                if (!hasLand(gx, gy + 1)) ctx.fillRect(px(gx), py(gy) + TILE - 1, TILE, 1);
                if (!hasLand(gx - 1, gy)) ctx.fillRect(px(gx), py(gy), 1, TILE);
                if (!hasLand(gx + 1, gy)) ctx.fillRect(px(gx) + TILE - 1, py(gy), 1, TILE);
            }

            // shoreline foam
            ctx.fillStyle = FOAM;
            for (const k of land) {
                const { x: gx, y: gy } = parseKey(k);
                if (hasLand(gx, gy + 1)) continue;
                if (rand01(gx * 101 + gy * 17) > 0.58) {
                    ctx.fillRect(px(gx) + 3, py(gy) + TILE + 2, 2, 1);
                }
            }

            // ==========================
            // HOUSE (properly seated)
            // ==========================

            // moved slightly up + left so it sits above cliff face
            const houseAnchor = {
                x: c1.x - 11,   // 1 tile further left
                y: c1.y + 3,    // 2 tiles higher
            };

            const houseX = px(houseAnchor.x) - 2;
            const houseY = py(houseAnchor.y) - 8;

            // ground shadow
            // ctx.fillStyle = "rgba(0,0,0,0.28)";
            // ctx.fillRect(houseX + 6, houseY + 41, 26, 3);

            // foundation tint
            ctx.fillStyle = SAND_DARK;
            ctx.fillRect(houseX + 6, houseY + 38, 26, 4);

            // roof
            drawOutlinedRect(ctx, houseX, houseY, 36, 11, HOUSE_ROOF, HOUSE_OUTLINE);
            ctx.fillStyle = HOUSE_ROOF_HI;
            ctx.fillRect(houseX + 1, houseY + 1, 34, 3);

            ctx.fillStyle = HOUSE_OUTLINE;
            ctx.fillRect(houseX + 4, houseY - 1, 28, 1);

            // walls
            drawOutlinedRect(ctx, houseX + 4, houseY + 11, 28, 28, HOUSE_WALL, HOUSE_OUTLINE);

            // wall shadow
            ctx.fillStyle = HOUSE_SHADOW;
            ctx.fillRect(houseX + 24, houseY + 11, 8, 28);

            // door + window
            drawOutlinedRect(ctx, houseX + 15, houseY + 24, 7, 15, DOOR, HOUSE_OUTLINE);
            drawOutlinedRect(ctx, houseX + 8, houseY + 20, 7, 7, WINDOW, HOUSE_OUTLINE);


            // ==========================
            // FACTORY PLACEMENT
            // ==========================
            function waterAdjCount(gx, gy) {
                let water = 0;
                for (const [nx, ny] of neighbors8(gx, gy)) {
                    if (!hasLand(nx, ny)) water++;
                }
                return water;
            }

            let best = null;
            for (const k of high) {
                const { x: gx, y: gy } = parseKey(k);
                if (gx < c2.x + 3) continue;

                const waterAdj = waterAdjCount(gx, gy);

                let highNeighbors = 0;
                for (const [nx, ny] of neighbors8(gx, gy)) {
                    if (hasHigh(nx, ny)) highNeighbors++;
                }

                const centerPenalty =
                    Math.abs(gx - highCenter.x) * 0.7 + Math.abs(gy - highCenter.y) * 0.9;

                const score = highNeighbors * 3 - waterAdj * 6 - centerPenalty;
                if (!best || score > best.score) best = { gx, gy, score };
            }

            const factoryTile = best ? { x: best.gx, y: best.gy } : { x: c2.x + 5, y: c2.y - 1 };

            // ==========================
            // FACTORY (outlined)
            // ==========================
            const FACT_W = 48;
            const FACT_H = 26;
            const factoryBaseY = py(factoryTile.y) + TILE - 1;
            const factoryX = px(factoryTile.x) - FACT_W + 26;
            const factoryY = factoryBaseY - FACT_H;

            const clampedFactoryX = Math.max(6, Math.min(w - FACT_W - 6, factoryX));

            ctx.fillStyle = "rgba(0,0,0,0.28)";
            ctx.fillRect(clampedFactoryX + 5, factoryBaseY, FACT_W - 10, 3);

            drawOutlinedRect(ctx, clampedFactoryX, factoryY, FACT_W, FACT_H, FACTORY, FACTORY_OUTLINE);

            ctx.fillStyle = FACTORY_HI;
            ctx.fillRect(clampedFactoryX + 1, factoryY + 1, FACT_W - 2, 4);

            drawOutlinedRect(ctx, clampedFactoryX + 10, factoryY + 10, 8, 8, "#404040", FACTORY_OUTLINE);
            drawOutlinedRect(ctx, clampedFactoryX + 22, factoryY + 10, 8, 8, "#404040", FACTORY_OUTLINE);
            drawOutlinedRect(ctx, clampedFactoryX + 34, factoryY + 10, 8, 8, "#404040", FACTORY_OUTLINE);

            drawOutlinedRect(ctx, clampedFactoryX + 32, factoryY - 18, 8, 22, FACTORY_DARK, FACTORY_OUTLINE);

            ctx.fillStyle = SMOKE1;
            ctx.fillRect(clampedFactoryX + 20, factoryY - 26, 9, 5);
            ctx.fillRect(clampedFactoryX + 29, factoryY - 30, 12, 6);
            ctx.fillRect(clampedFactoryX + 42, factoryY - 26, 9, 5);

            ctx.fillStyle = SMOKE2;
            ctx.fillRect(clampedFactoryX + 23, factoryY - 24, 6, 3);
            ctx.fillRect(clampedFactoryX + 33, factoryY - 28, 6, 3);

            // ==========================
            // RISING WATER OVERLAY (optional)
            // ==========================
            const level = clamp01(waterLevel);
            const maxRisePx = 56;
            const rise = Math.floor(level * maxRisePx);

            if (rise > 0) {
                ctx.fillStyle = "rgba(10, 30, 70, 0.22)";
                ctx.fillRect(0, h - rise, w, rise);
            }
        },
        [waterLevel]
    );

    return (
        <div className="pixelStage">
            <PixelCanvas width={LOGICAL_W} height={LOGICAL_H} draw={draw} className="pixelCanvas" />
        </div>
    );
}
