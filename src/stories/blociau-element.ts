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
  public runningState: RunningState = "stopped";

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
          ? html`<button @click="${() => this.stop()}">Stop</button>`
          : ""}
      </div>
      <div>
        ${this.runningState === "stopped"
          ? html`<button @click="${() => this.start()}">Start</button>`
          : ""}
      </div>
      <div>
        ${this.runningState === "paused"
          ? html`<button @click="${() => this.resume()}">Continue</button>`
          : ""}
      </div>
    `;
  }

  private pause(): void {
    this.blociau?.pause();
    this.runningState = "paused";
    this.requestUpdate();
  }

  private stop(): void {
    this.blociau?.stop();
    this.runningState = "stopped";
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

  static styles = css``;
}

declare global {
  interface HTMLElementTagNameMap {
    "blociau-element": BlociauElement;
  }
}
