import { CanvasGrid, RenderedGrid } from '../models/grid';

export interface Renderer {
  render(grid: CanvasGrid, animatedStateRows: RenderedGrid): void;
}
