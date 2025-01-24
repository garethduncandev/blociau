import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Blociau, RunningState } from "../lib/blociau";
import { Options } from "../lib/models/options";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("blociau-element")
export class BlociauElement extends LitElement {
  @property({ type: String })
  public runningState: RunningState = "reset";

  @property({ attribute: false })
  options: Options | undefined;

  private blociau: Blociau | undefined;

  public constructor() {
    super();
  }

  public async connectedCallback() {
    if (!this.options) {
      throw new Error("No options provided");
    }

    super.connectedCallback();
    this.blociau = await new Blociau(this.options);
    await this.blociau.start();
    this.runningState = this.blociau.runningState;
    this.requestUpdate();
  }

  protected render() {
    return html`
      <div id="output">${this.options?.outputElement}</div>
      <div>
        ${this.runningState === "running"
          ? html`<button @click="${() => this.pause()}">Pause</button>`
          : ""}
      </div>
      <div>
        ${this.runningState === "running"
          ? html`<button @click="${() => this.stop()}">Reset</button>`
          : ""}
      </div>
      <div>
        ${this.runningState === "reset"
          ? html`<button @click="${() => this.start()}">Start</button>`
          : ""}
      </div>
      <div>
        ${this.runningState === "running"
          ? html`<button @click="${() => this.restart()}">Restart</button>`
          : ""}
      </div>
      <div>
        ${this.runningState === "paused"
          ? html`<button @click="${() => this.resume()}">Continue</button>`
          : ""}
      </div>
      <div>
        ${html`<button @click="${() => this.exportGrid()}">
          export grid
        </button>`}
      </div>
      <div>
        ${html`<button @click="${() => this.exportGridJson()}">
          Export grid as json
        </button>`}
      </div>
    `;
  }

  private pause(): void {
    this.blociau?.pause();
    this.runningState = "paused";
    this.requestUpdate();
  }

  private stop(): void {
    this.blociau?.reset();
    this.runningState = "reset";
    this.requestUpdate(this.runningState);
  }

  private resume(): void {
    this.blociau?.resume();
    this.runningState = "running";
    this.requestUpdate(this.runningState);
  }

  private start(): void {
    this.blociau?.start();
    this.runningState = "running";
    this.requestUpdate(this.runningState);
  }
  private restart(): void {
    this.blociau?.restart();
    this.runningState = "running";
    this.requestUpdate(this.runningState);
  }

  private exportGrid(): void {
    const grid = this.blociau?.exportGrid();
    console.log(grid);
  }

  private exportGridJson(): void {
    const grid = this.blociau?.exportGrid();
    console.log(JSON.stringify(grid));
  }

  static styles = css``;
}

declare global {
  interface HTMLElementTagNameMap {
    "blociau-element": BlociauElement;
  }
}
