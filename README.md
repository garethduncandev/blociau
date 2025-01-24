# Blociau

A simple library that helps create a 'typing code' animation (currently as an svg).
Pass an image in as an input to produce an outline, or let it randomly generate lines.

## Installation

```
    npm install blociau
```

## Setup

### Using an image

When using an image, it is best to use a simple monochrome image.
The library works by detecting where a pixel is white/transparent or not.
So be careful when using JPEGs, PNGs work best. SVGs may also work, but so far it fails in Firefox.

```typescript
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

const blociau = await new Blociau(options);
```

Refer to the available storybook stories for more examples.

### Randomly generated

This is a much simpler output, perfect for a 'loading' animation.

```typescript
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

const blociau = await new Blociau(options);
```

## Future developments

The library does use a lit web component with storybook. The web component is not yet published, but it is a future goal to do so.
