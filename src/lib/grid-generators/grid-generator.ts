import { CanvasGrid } from '../models/grid';

export interface GridGenerator {
  create(...args: unknown[]): CanvasGrid | Promise<CanvasGrid>;
}
