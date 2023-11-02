import { AnimationCss } from './animate-css';

/**
 * Animates the typing of code blocks in an SVG element.
 *
 * @param id - The ID to use for the animation.
 * @param svg - The SVG element containing the code blocks to animate.
 * @param padding - The padding to add to each code block.
 * @param codeBlockMinWidth - The minimum width of each code block.
 * @param speed - The speed of the animation.
 * @param delay - The delay before the animation starts.
 * @returns An instance of the AnimateCss class.
 */
export function animate(
  id: string,
  svg: SVGSVGElement,
  padding: number,
  codeBlockMinWidth: number,
  speed: number,
  delay: number
): AnimationCss {
  const keyframesTypingCssRule = `
        @keyframes ${id}-typing {
            from {
                width: 0;
            }
            to {
                visibility: visible;
            }
        }
        `;

  const rects = svg.getElementsByTagName('rect');

  let previousAnimationDuration = delay;
  let previousRect: SVGRectElement | undefined = undefined;

  // random times to mimim random keystrokes
  const keyStokeTimes = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233];

  for (let i = 0; i < rects.length; i++) {
    const randomIndex = Math.floor(Math.random() * keyStokeTimes.length);
    const randomKeyStrokeTime = keyStokeTimes[randomIndex] * speed;

    const rect = rects[i];

    const previousWidth = previousRect
      ? previousRect?.width.baseVal.value + padding
      : 0;

    const currentWidth = rect.width.baseVal.value + padding;

    const delayTime =
      previousAnimationDuration + previousWidth / codeBlockMinWidth;

    const animationDuration =
      (currentWidth / codeBlockMinWidth) * randomKeyStrokeTime;
    previousAnimationDuration = previousAnimationDuration + animationDuration;
    rect.style.visibility = 'hidden';

    const steps = currentWidth / codeBlockMinWidth;
    rect.style.animation = `
    ${id}-typing ${animationDuration}ms ${delayTime}ms steps(${steps}, start) forwards`;

    previousRect = rect;
  }

  return new AnimationCss([keyframesTypingCssRule]);
}
