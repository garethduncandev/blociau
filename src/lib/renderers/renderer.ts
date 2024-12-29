import { CanvasGrid, RenderedRow } from "../models/grid";

export interface Renderer {
  render(grid: CanvasGrid, renderedRows: RenderedRow[]): void;
  destroy(): void;
}
