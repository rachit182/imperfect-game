// import React, { useEffect, useRef } from "react";

// /**
//  * PixelCanvas
//  * - draw(ctx, w, h) draws into a logical pixel grid (w x h)
//  * - canvas is then scaled via CSS to fit its container, with crisp pixels
//  */
// export default function PixelCanvas({ width, height, draw, className }) {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     // Logical resolution
//     canvas.width = width;
//     canvas.height = height;

//     const ctx = canvas.getContext("2d", { alpha: true });
//     if (!ctx) return;

//     // No anti-aliasing
//     ctx.imageSmoothingEnabled = false;

//     // Clear + draw
//     ctx.clearRect(0, 0, width, height);
//     draw(ctx, width, height);
//   }, [width, height, draw]);

//   return (
//     <canvas
//       ref={canvasRef}
//       className={className}
//       style={{
//         width: "100%",
//         height: "100%",
//         imageRendering: "pixelated",
//         display: "block",
//       }}
//     />
//   );
// }



import React from "react";
import IslandScene from "./IslandScene";
import { useGame } from "../GameContext";

export default function IslandView() {
  const { state } = useGame();

  // Adjust this key if yours is named differently
  const localEnv = state.localEnvironment ?? 100; // expected 0..100

  // Map 0..100 -> 0..1
  const waterLevel = Math.max(0, Math.min(1, (100 - localEnv) / 100));

  return <IslandScene waterLevel={waterLevel} />;
}
