# Blociau

## How does it work?

At its core, Blociau is an animation that mimics typing code.

There are currently two ways to use Blociau:

1. **As a continuous animation**: You can use Blociau to generate a continuous random animation of code typing.
2. **With an existing image**: Blociau will type of code animation that follows the outline of the image. The animation will finish once the whole image has been generated.

## Solution (pseudo code)

This will be updated as the solution is developed.

### Continuous animation

#### Input parameters

a. Canvas dimensions
b. Character height
c. Character width
d. Character colors e.g. VSCode theme
e. Max word length (default 25% of canvas width)

#### Steps

Step 1 - prepare array
Create 2 dimensional array based on canvas dimensions, character height and width.
(The result of this method will be the same to represent an image - each line may have multiple segments.
With the continuous animation, each line will have 1 segment)

Array length (lines) = Math.floor(canvas height / character height)
Array width (characters/words) = Math.floor(canvas width / character width)

```
[
    {
        "lineNumber": 1,
        "segments": [
            {
                length: 10
            }
        ]
    }
]
```

Step 2 - prepare line animation

For each line, generate an array of random length words.
Each line will be a random length.
With each word, the color will be based on the length of the word, the length will be random and different to the previous word.
When calculating the length of the word, take into consideration the remaining space on the line.
Between each word is a space.
Randomly between 20% and 40% of the lines, the next line will be a "comment" line, where it is all the same color. e.g. green

Step 3 - animate
For each character, delay drawing by a random time interval.
Randomly, animate a mistake, resulting in a random number of backspaces.
Each backspace will have a random (but much smaller) delay.

Step 4.
After the final line, the animation enters the scroll phase.
The first line in the resulting array is removed,
and a new line is drawn at the bottom of the canvas.
