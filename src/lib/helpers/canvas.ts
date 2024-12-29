export function createContext(
  canvasWidth: number,
  canvasHeight: number,
): CanvasRenderingContext2D {
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("Could not get context");
  }
  return context;
}

export function isWhiteOrTransparent(
  context: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  blockWidth: number,
  blockHeight: number,
): boolean {
  const pixelData = context.getImageData(
    startX,
    startY + Math.floor(blockHeight / 2),
    blockWidth,
    1,
  ).data;

  let whiteOrTransparent = true;
  for (let i = 0; i < pixelData.length; i += 4) {
    const red = pixelData[i];
    const green = pixelData[i + 1];
    const blue = pixelData[i + 2];
    const alpha = pixelData[i + 3];

    // if 100% transparent, ignore even if it has color
    if (alpha === 0) {
      continue;
    }

    // if any color, then it's not white or transparent
    if (red < 255 || green < 255 || blue < 255) {
      whiteOrTransparent = false;
      break;
    }
  }
  return whiteOrTransparent;
}
