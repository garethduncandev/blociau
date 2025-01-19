import { CanvasGrid, CanvasRow } from "../models/grid";

import { GridGenerator } from "./grid-generator";

export class RandomGridGenerator implements GridGenerator {
  public create(rowsCount: number, rowCharactersCount: number): CanvasGrid {
    const canvasGrid: CanvasGrid = {
      maxVisibleRows: rowsCount,
      rows: [],
    };

    for (let i = 0; i < canvasGrid.maxVisibleRows; i++) {
      const row = this.createRow(rowCharactersCount);

      canvasGrid.rows.push(row);
    }

    return canvasGrid;
  }

  public createRow(charactersPerRow: number): CanvasRow {
    const maxVisibleCharactersPerRow = this.randomNumber(1, charactersPerRow);

    const row: CanvasRow = {
      characters: [],
    };
    for (let character = 0; character < charactersPerRow; character++) {
      row.characters.push({
        visible: character <= maxVisibleCharactersPerRow,
      });
    }

    return row;
  }

  public randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
