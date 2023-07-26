export default function removeSubstrings(
  originalString: string,
  substringsToRemove: string[]
) {
  // Loop through each substring in the array
  for (const substringToRemove of substringsToRemove) {
    // Find the index of the substring to be removed
    let index = originalString.indexOf(substringToRemove);

    // Loop until all occurrences of the substring are removed
    while (index !== -1) {
      // Use the substring() method to remove the specified substring
      const firstPart = originalString.substring(0, index);
      const secondPart = originalString.substring(
        index + substringToRemove.length
      );
      originalString = firstPart + secondPart;

      // Find the next index of the substring to be removed
      index = originalString.indexOf(substringToRemove);
    }
  }

  // Return the resulting string after removing all substrings
  return originalString;
}
