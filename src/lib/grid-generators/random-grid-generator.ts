import { CanvasGrid, CanvasRow } from "../models/grid";

import { GridGenerator } from "./grid-generator";

export class RandomGridGenerator implements GridGenerator {
  public create(rowsCount: number, rowCharactersCount: number): CanvasGrid {
    const canvasGrid: CanvasGrid = {
      maxVisibleRows: rowsCount,
      rows: [],
    };

    for (let i = 0; i < canvasGrid.maxVisibleRows; i++) {
      const maxVisibleCharactersPerRow = this.randomNumber(
        1,
        rowCharactersCount,
      );
      const row = this.createRow(
        rowCharactersCount,
        maxVisibleCharactersPerRow,
      );

      canvasGrid.rows.push(row);
    }

    return canvasGrid;
  }

  public createRow(
    charactersPerRow: number,
    maxVisibleCharacters: number,
  ): CanvasRow {
    const row: CanvasRow = {
      characters: [],
    };
    for (let character = 0; character < charactersPerRow; character++) {
      row.characters.push({
        visible: character <= maxVisibleCharacters,
      });
    }

    return row;
  }

  public randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
