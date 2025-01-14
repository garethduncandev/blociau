import { html } from "lit-html";
import "./blociau-element"; // Ensure the correct path to your component
import { Meta } from "@storybook/web-components";
import { Options } from "../lib/models/options";

const meta = {
  title: "Blociau Element",
  component: "blociau-element",
} satisfies Meta<Options>;

export default meta;

function loadImg(imgSrc: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imgSrc;
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
  });
}

const outputElement = document.createElement("div");
outputElement.id = "output";
const image = await loadImg("vite.svg");

const imageExample: Options = {
  canvasHeight: 32,
  canvasWidth: 32,
  characterHeight: 2,
  characterWidth: 2,
  padding: 0.1,
  borderRadius: 0.1,
  wordStyles: [
    {
      wordLength: 1,
      colors: ["rgb(0, 105, 243)", "rgb(197, 134, 160)"],
    },
    {
      wordLength: 2,
      colors: ["rgb(79, 193, 255)", "rgb(156, 220, 254)", "rgb(0, 89, 206)"],
    },
    {
      wordLength: 3,
      colors: ["rgb(189, 87, 129)", "rgb(77, 201, 176)", "rgb(0, 122, 216)"],
    },
    {
      wordLength: 4,
      colors: ["rgb(220, 220, 138)", "rgb(106, 153, 81)"],
    },
  ],
  inputType: "img",
  outputType: "svg",
  outputElement: outputElement,
  keystrokeCorrectPercentage: 99,
  speed: 1,
  minTypingDelayMilliseconds: 50,
  maxTypingDelayMilliseconds: 150,
  historySize: 5,
  image: image,
};

export const Default = () =>
  html`<blociau-element .options=${imageExample}></blociau-element>`;

const continuousExample: Options = {
  canvasHeight: 50,
  canvasWidth: 100,
  characterHeight: 10,
  characterWidth: 10,
  padding: 0.1,
  borderRadius: 0.1,
  wordStyles: [
    {
      wordLength: 1,
      colors: ["rgb(0, 105, 243)", "rgb(197, 134, 160)"],
    },
    {
      wordLength: 2,
      colors: ["rgb(79, 193, 255)", "rgb(156, 220, 254)", "rgb(0, 89, 206)"],
    },
    {
      wordLength: 3,
      colors: ["rgb(189, 87, 129)", "rgb(77, 201, 176)", "rgb(0, 122, 216)"],
    },
    {
      wordLength: 4,
      colors: ["rgb(220, 220, 138)", "rgb(106, 153, 81)"],
    },
  ],
  inputType: "random",
  outputType: "svg",
  outputElement: outputElement,
  keystrokeCorrectPercentage: 99,
  speed: 1,
  minTypingDelayMilliseconds: 50,
  maxTypingDelayMilliseconds: 150,
  historySize: 5,
  image: undefined,
};

export const Continuous = () =>
  html`<blociau-element .options=${continuousExample}></blociau-element>`;
