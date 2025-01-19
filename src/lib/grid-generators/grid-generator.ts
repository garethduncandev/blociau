import { CanvasGrid, CanvasRow } from "../models/grid";

export interface GridGenerator {
  create(...args: unknown[]): CanvasGrid | Promise<CanvasGrid>;
  createRow(charactersPerRow: number): CanvasRow;
}
