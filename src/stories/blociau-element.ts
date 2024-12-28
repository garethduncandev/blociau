import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Blociau, RunningState } from '../lib/blociau';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('blociau-element')
export class BlociauElement extends LitElement {
  private blociau: Blociau | undefined;
  public outputElement: HTMLElement;
  public constructor() {
    super();
    this.outputElement = document.createElement('div');
    this.outputElement.id = 'output';
  }

  @property()
  public runningState: RunningState = 'stopped';

  public async connectedCallback() {
    super.connectedCallback();
    this.blociau = await this.createBlociau();
    await this.blociau.start();
    this.runningState = this.blociau.runningState;
    this.requestUpdate();
  }

  protected render() {
    return html`
      <div id="output">${this.outputElement}</div>
      <div>
        ${this.runningState === 'running'
          ? html`<button @click="${() => this.pause()}">Pause</button>`
          : ''}
      </div>
      <div>
        ${this.runningState === 'running'
          ? html`<button @click="${() => this.stop()}">Stop</button>`
          : ''}
      </div>
      <div>
        ${this.runningState === 'stopped'
          ? html`<button @click="${() => this.start()}">Start</button>`
          : ''}
      </div>
      <div>
        ${this.runningState === 'paused'
          ? html`<button @click="${() => this.resume()}">Continue</button>`
          : ''}
      </div>
    `;
  }

  private pause(): void {
    this.blociau?.pause();
    this.runningState = 'paused';
    this.requestUpdate();
  }

  private stop(): void {
    this.blociau?.stop();
    this.runningState = 'stopped';
    this.requestUpdate(this.runningState);
  }

  private resume(): void {
    this.blociau?.resume();
    this.runningState = 'running';
    this.requestUpdate(this.runningState);
  }

  private start(): void {
    this.blociau?.start();
    this.runningState = 'running';
    this.requestUpdate(this.runningState);
  }

  static styles = css`
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }
  `;

  private async loadImg(imgSrc: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imgSrc;
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
    });
  }

  private async createBlociau(): Promise<Blociau> {
    const image = await this.loadImg('dev.png');

    const blociau = new Blociau({
      canvasHeight: 32,
      canvasWidth: 32,
      characterHeight: 11,
      characterWidth: 11,
      padding: 1,
      borderRadius: 1,
      wordStyles: [
        {
          wordLength: 1,
          colors: ['rgb(0, 105, 243)', 'rgb(197, 134, 160)'],
        },
        {
          wordLength: 2,
          colors: [
            'rgb(79, 193, 255)',
            'rgb(156, 220, 254)',
            'rgb(0, 89, 206)',
          ],
        },
        {
          wordLength: 3,
          colors: [
            'rgb(189, 87, 129)',
            'rgb(77, 201, 176)',
            'rgb(0, 122, 216)',
          ],
        },
        {
          wordLength: 4,
          colors: ['rgb(220, 220, 138)', 'rgb(106, 153, 81)'],
        },
      ],
      inputType: 'img',
      outputType: 'svg',
      outputElement: this.outputElement,
      minTypingDelayMilliseconds: 100,
      maxTypingDelayMilliseconds: 150,
      speed: 2,
      historySize: 5,
      image: image,
    });

    return blociau;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'blociau-element': BlociauElement;
  }
}
