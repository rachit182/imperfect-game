/**
 * drawAsciiArt(ctx, art, palette, x, y)
 * Draws a multi-line ASCII art string to the canvas.
 * Each character becomes a 1x1 logical pixel.
 */
export function drawAsciiArt(ctx, art, palette, x = 0, y = 0) {
    const rows = art
        .trim()
        .split("\n")
        .map((r) => r.replace(/\r/g, ""));

    for (let j = 0; j < rows.length; j++) {
        const row = rows[j];
        for (let i = 0; i < row.length; i++) {
            const ch = row[i];
            const color = palette[ch];
            if (!color || color === "transparent") continue;
            ctx.fillStyle = color;
            ctx.fillRect(x + i, y + j, 1, 1);
        }
    }
}
