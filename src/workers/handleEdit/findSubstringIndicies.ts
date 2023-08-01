export default function findSubstringIndices(str: string, substring: string): number[] {
  const indices: number[] = [];
  let currentIndex = str.indexOf(substring);

  while (currentIndex !== -1) {
    indices.push(currentIndex);
    currentIndex = str.indexOf(substring, currentIndex + 1);
  }

  return indices;
}
