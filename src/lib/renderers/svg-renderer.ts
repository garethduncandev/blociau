import { CanvasGrid, RenderedRow } from "../models/grid";
import { Renderer } from "./renderer";

export class SvgRenderer implements Renderer {
  private svg?: SVGSVGElement;
  public constructor(
    public canvasWidth: number,
    public canvasHeight: number,
    public maxCharactersPerRow: number,
    public characterWidth: number,
    public characterHeight: number,
    public outputElement: HTMLElement,
    public padding: number,
    public borderRadius: number,
  ) {}

  public render(grid: CanvasGrid, renderedRows: RenderedRow[]): void {
    if (!this.svg) {
      this.svg = this.renderSvg(grid, this.outputElement);
    }

    const paths = this.svg.querySelectorAll<SVGPathElement>(`path`) ?? [];

    const totalNumberOfRenderedCharacters =
      this.totalNumberOfRenderedCharacters(renderedRows);

    this.setPathsTransparent(paths, totalNumberOfRenderedCharacters);

    for (
      let renderedRowIndex = 0;
      renderedRowIndex < renderedRows.length;
      renderedRowIndex++
    ) {
      const renderedRow = renderedRows[renderedRowIndex];
      this.renderRow(paths, grid, renderedRowIndex, renderedRow);
    }
  }

  public destroy(): void {
    this.svg?.remove();
  }

  private totalNumberOfRenderedCharacters(renderedRows: RenderedRow[]): number {
    let total = 0;

    for (const renderedRow of renderedRows) {
      total += renderedRow.characters.length;
    }
    return total;
  }

  private setPathsTransparent(
    paths: NodeListOf<SVGPathElement>,
    startIndex: number,
  ): void {
    for (let i = startIndex; i < paths.length; i++) {
      const path = paths[i];
      if (path.getAttribute("fill") !== "transparent") {
        path.setAttribute("fill", "transparent");
      }
    }
  }

  private renderRow(
    paths: NodeListOf<SVGPathElement> | never[],
    grid: CanvasGrid,
    renderedRowIndex: number,
    renderedRow: RenderedRow,
  ): void {
    for (
      let characterIndex = 0;
      characterIndex < renderedRow.characters.length;
      characterIndex++
    ) {
      const renderedCharacter = renderedRow.characters[characterIndex];
      const gridCharacter =
        grid.rows[renderedRowIndex].characters[characterIndex];

      const svgCharacter: SvgCharacter = {
        color: renderedCharacter.color,
        visible: gridCharacter.visible,
      };

      const renderedPreviousCharacter =
        characterIndex > 0
          ? renderedRow.characters[characterIndex - 1]
          : undefined;

      const gridPreviousCharacter =
        characterIndex > 0
          ? grid.rows[renderedRowIndex].characters[characterIndex - 1]
          : undefined;

      const previousSvgCharacter: SvgCharacter | undefined =
        renderedPreviousCharacter && gridPreviousCharacter
          ? {
              color: renderedPreviousCharacter.color ?? "",
              visible: gridPreviousCharacter.visible ?? false,
            }
          : undefined;

      const lastCharacterIndex = renderedRow.characters.length - 1;

      const renderedNextCharacter =
        characterIndex + 1 <= lastCharacterIndex
          ? renderedRow.characters[characterIndex + 1]
          : undefined;

      const gridNextCharacter =
        characterIndex + 1 <= lastCharacterIndex
          ? grid.rows[renderedRowIndex].characters[characterIndex + 1]
          : undefined;

      const nextSvgCharacter: SvgCharacter | undefined =
        renderedNextCharacter && gridNextCharacter
          ? {
              color: renderedNextCharacter.color ?? "",
              visible: gridNextCharacter.visible ?? false,
            }
          : undefined;

      this.renderCharacter(
        paths,
        grid,
        renderedRowIndex,
        characterIndex,
        svgCharacter,
        previousSvgCharacter,
        nextSvgCharacter,
      );
    }
  }

  private renderCharacter(
    paths: NodeListOf<SVGPathElement> | never[],
    grid: CanvasGrid,
    renderedRowIndex: number,
    renderedCharacterIndex: number,

    svgCharacter: SvgCharacter,
    previousSvgCharacter: SvgCharacter | undefined,
    nextSvgCharacter: SvgCharacter | undefined,
  ): void {
    const path =
      paths[
        renderedRowIndex * this.maxCharactersPerRow + renderedCharacterIndex
      ];

    const newWord =
      !previousSvgCharacter ||
      !previousSvgCharacter.visible ||
      svgCharacter.color !== previousSvgCharacter?.color;

    const lastCharacterOfWord =
      !nextSvgCharacter ||
      !nextSvgCharacter.visible ||
      svgCharacter.color !== nextSvgCharacter?.color;

    const row = grid.rows[renderedRowIndex];
    const gridEntry = row.characters[renderedCharacterIndex];
    const visible = gridEntry.visible;

    if (!visible) {
      path.setAttribute("fill", "transparent");
      return;
    }

    path.setAttribute("fill", svgCharacter.color);

    const startX = renderedCharacterIndex * this.characterWidth;
    const startY = renderedRowIndex * this.characterHeight;

    let border: Border = "none";
    if (newWord && lastCharacterOfWord) {
      border = "both";
    } else if (newWord) {
      border = "left";
    } else if (lastCharacterOfWord) {
      border = "right";
    }

    const newPath = this.createSvgPathAttributeValue(
      startX,
      startY,
      this.characterWidth,
      this.characterHeight,
      border,
    );

    path.setAttribute("d", newPath);
  }

  private renderSvg(grid: CanvasGrid, outputElement: HTMLElement) {
    // get the svg from the dom

    // render svg based on the grid and animated state
    const svg = this.createSvg(
      grid,
      this.canvasWidth,
      this.canvasHeight,
      outputElement.id,
    );

    // get the output element from the dom
    if (outputElement) {
      outputElement.innerHTML = "";
      outputElement.appendChild(svg);
    }
    return svg;
  }

  private createSvg(
    grid: CanvasGrid,
    width: number,
    height: number,
    id: string,
  ): SVGSVGElement {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("xmlns:svg", "http://www.w3.org/2000/svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    const elementNS = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    elementNS.setAttribute("id", `${id}-code-blocks-group`);
    elementNS.setAttribute("shape-rendering", "crispEdges");

    svg.appendChild(elementNS);
    const paths = this.createSvgPath(grid);
    for (const path of paths) {
      elementNS.appendChild(path);
    }

    return svg;
  }

  private createSvgPath(grid: CanvasGrid): SVGPathElement[] {
    const paths: SVGPathElement[] = [];
    let startX = 0;
    let startY = 0;
    for (const [rowIndex, row] of grid.rows.entries()) {
      startX = 0;

      for (const [charIndex] of row.characters.entries()) {
        // create path that looks like a path
        const characterPath = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );

        const attributeValue = this.createSvgPathAttributeValue(
          startX,
          startY,
          this.characterWidth,
          this.characterHeight,
          "none",
        );

        characterPath.setAttribute("d", attributeValue);
        characterPath.classList.add(`char-${rowIndex}-${charIndex}`);
        characterPath.setAttribute("fill", "transparent");

        paths.push(characterPath);
        startX += this.characterWidth;
      }

      startY += this.characterHeight;
    }

    return paths;
  }

  private createSvgPathAttributeValue(
    startX: number,
    startY: number,
    characterWidth: number,
    characterHeight: number,
    border: Border,
  ): string {
    const radius = this.borderRadius;
    const padding = this.padding;

    if (border === "left") {
      return `
        M${startX + radius + padding},${startY + padding} 
        h${characterWidth - (radius + padding)} 
        v${characterHeight - padding * 2} 
        h-${characterWidth - (radius + padding)} 
        q-${radius},0 -${radius},-${radius} 
        v-${characterHeight - (radius * 2 + padding * 2)} 
        q0,-${radius} ${radius},-${radius} 
        z
      `;
    }
    if (border === "right") {
      return `
        M${startX},${startY + padding} 
        h${characterWidth - (radius + padding)} 
        q${radius},0 ${radius},${radius} 
        v${characterHeight - (radius * 2 + padding * 2)} 
        q0,${radius} -${radius},${radius} 
        h-${characterWidth - radius - padding} 
        v-${characterHeight - padding * 2}
        z`;
    }

    if (border === "both") {
      return `
        M${startX + radius + padding},${startY + padding} 
        h${characterWidth - (radius * 2 + padding * 2)} 
        q${radius},0 ${radius},${radius} 
        v${characterHeight - (radius * 2 + padding * 2)} 
        q0,${radius} -${radius},${radius} 
        h-${characterWidth - (radius * 2 + padding * 2)} 
        q-${radius},0 -${radius},-${radius} 
        v-${characterHeight - (radius * 2 + padding * 2)} 
        q0,-${radius} ${radius},-${radius} 
        z`;
    }

    // no border
    return `
      M${startX},${startY + padding} 
      h${characterWidth} 
      v${characterHeight - padding * 2} 
      h-${characterWidth} 
      z
    `;
  }
}

interface SvgCharacter {
  color: string;
  visible: boolean;
}
type Border = "left" | "right" | "both" | "none";
