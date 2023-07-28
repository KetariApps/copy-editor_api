export function splitStringAtPositions(str: string, positions: number[]) {
  // Sort the positions array in ascending order
  positions.sort((a, b) => a - b);

  // Initialize an array to hold the substrings
  const substrings = [];
  let start = 0;

  // Iterate through the positions array and split the string accordingly
  for (let i = 0; i < positions.length; i++) {
    const position = positions[i];

    // Check if the position is valid (greater than the start and less than the string length)
    if (position > start && position < str.length) {
      substrings.push(str.substring(start, position));
      start = position;
    }
  }

  // Add the remaining part of the string to the substrings array
  if (start < str.length) {
    substrings.push(str.substring(start));
  }

  return substrings;
}
