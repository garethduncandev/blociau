import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Blociau } from '../lib/blociau';

export interface BlociauProps {}

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

  /**
   * Copy for the read the docs hint.
   */
  @property({ type: String })
  docsHint = 'Click on the Vite and Lit logos to learn more';

  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Number })
  count = 0;

  public async connectedCallback() {
    super.connectedCallback();
    this.blociau = await this.createBlociau();
    this.blociau.start();
  }

  protected render() {
    return html` <div id="output">${this.outputElement}</div> `;
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
    const image = await this.loadImg('vite.svg');

    const blociau = new Blociau({
      canvasHeight: 32,
      canvasWidth: 32,
      characterHeight: 2,
      characterWidth: 2,
      padding: 0.1,
      borderRadius: 0.1,
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
      maxErrorPercentage: 10,
      minTypingDelay: 50,
      maxTypingDelay: 150,
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
