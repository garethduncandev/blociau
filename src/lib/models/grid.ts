export interface CanvasGrid {
  maxVisibleRows: number;
  rows: CanvasRow[];
}

export interface CanvasRow {
  characters: CanvasCharacter[];
}

export interface CanvasCharacter {
  // Will always be true for continuous mode
  // Some can be false if using an image for the outline
  visible: boolean;
}

export interface RenderedRow {
  line: number;
  type: RenderedRowType;
  characters: RenderedCharacter[];
}

export interface RenderedCharacter {
  wordIndex: number;
  rendered: boolean;
  color: string;
  renderTime: DOMHighResTimeStamp;
}

export interface RenderedWord {
  wordIndex: number;
  wordLength: number;
  color: string;
}

export type RenderedRowType = "code" | "comment" | "empty";
