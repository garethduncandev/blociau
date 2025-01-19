import { createContext, isWhiteOrTransparent } from "../helpers/canvas";
import { CanvasGrid, CanvasRow } from "../models/grid";
import { GridGenerator } from "./grid-generator";

export class ImageGridGenerator implements GridGenerator {
  public async create(
    image: HTMLImageElement,
    characterHeight: number,
    characterWidth: number,
  ): Promise<CanvasGrid> {
    const context = createContext(image.width, image.height);
    context.drawImage(image, 0, 0, image.width, image.height);
    const rowsCount = Math.floor(image.height / characterHeight);
    const columnsCount = Math.round(image.width / characterWidth);

    const canvasGrid: CanvasGrid = { maxVisibleRows: rowsCount, rows: [] };

    for (let rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
      const row: CanvasRow = { characters: [] };
      for (let columnIndex = 0; columnIndex < columnsCount; columnIndex++) {
        const startX = columnIndex * characterWidth;
        const startY = rowIndex * characterHeight;
        const characterVisible = !isWhiteOrTransparent(
          context,
          startX,
          startY,
          characterWidth,
          characterHeight,
        );
        row.characters.push({ visible: characterVisible });
      }
      canvasGrid.rows.push(row);
    }

    return canvasGrid;
  }

  public createRow(): CanvasRow {
    throw new Error("Method not implemented.");
  }
}
