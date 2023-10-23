export function animate(
  id: string,
  svg: SVGSVGElement,
  padding: number,
  codeBlockMinWidth: number,
  speed: number
): void {
  const style =
    document.querySelector('style') || document.createElement('style');
  document.head.appendChild(style);

  const keyframesTyping = `
        @keyframes ${id}-typing {
            from {
                width: 0;
            }
            to {
                visibility: visible;
            }
        }
        `;

  style.sheet?.insertRule(keyframesTyping, style.sheet.cssRules.length);

  const rects = svg.getElementsByTagName('rect');

  let previousAnimationDuration = 0;
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
}
