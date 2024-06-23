export function splitNumberIntoRandomNonRepeatingArray(
  sum: number,
  min: number,
  max: number
): number[] {
  const maxArrayLength = Math.floor(sum / min);

  const allPossibleValues = Array.from(Array(maxArrayLength).keys())
    .map((m) => (m + 1) * min)
    .filter((x) => x <= max);

  let remainingSum = sum;
  const result: number[] = [];
  while (remainingSum > 0 && remainingSum >= min) {
    const remainingPossibleValues = calculateRemainingPossibleValues(
      result,
      allPossibleValues,
      remainingSum,
      min
    );

    if (remainingPossibleValues.length === 0) {
      break;
    }

    const randomIndex = Math.floor(
      Math.random() * remainingPossibleValues.length
    );
    const randomNumber = remainingPossibleValues[randomIndex];

    result.push(randomNumber);
    remainingSum -= randomNumber;
  }

  return result;
}

function calculateRemainingPossibleValues(
  currentResult: number[],
  allPossibleValues: number[],
  remainingSum: number,
  min: number
): number[] {
  // Create new possible remaining values:
  // 1. If we have no result yet, all values are possible
  // 2. If possible values length is 1, then we use the existing possible values
  // 3. If remaining sum equals min value, then we use the existing possible values
  // 4. If 1 and 2 are not true then we
  // 5. a) filter out the previous value
  // 6. b) filter out all values that are larger than the remaining sum

  if (currentResult.length === 0) {
    return allPossibleValues;
  }

  if (allPossibleValues.length === 1) {
    return allPossibleValues;
  }

  if (remainingSum === min) {
    return [min];
  }

  return allPossibleValues
    .filter((x) => x !== currentResult[currentResult.length - 1])
    .filter((x) => x <= remainingSum);
}
