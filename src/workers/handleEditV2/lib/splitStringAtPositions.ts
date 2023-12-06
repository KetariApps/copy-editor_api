import { SuggestionWithAnchor } from "../types.js";

export function splitStringAtPositions(
  str: string,
  positions: [string, number][]
) {
  // Sort the positions array in ascending order
  positions.sort((a, b) => a[1] - b[1]);

  // Initialize an array to hold the substrings
  const substrings: SuggestionWithAnchor[] = [];
  let start = 0;

  // Iterate through the positions array and split the string accordingly
  for (let i = 0; i < positions.length; i++) {
    const position = positions[i];

    // Check if the position is valid (greater than the start and less than the string length)
    if (position[1] > start && position[1] < str.length) {
      const sliceEnd = position[1] + position[0].length;
      const slice = str.substring(start, sliceEnd);
      const content = slice.substring(0, slice.length - position[0].length);
      substrings.push({ content, anchor: position });
      start = sliceEnd;
    }
  }

  // Add the remaining part of the string to the substrings array
  if (start < str.length) {
    substrings.push({ content: str.substring(start) });
  }

  return substrings;
}
