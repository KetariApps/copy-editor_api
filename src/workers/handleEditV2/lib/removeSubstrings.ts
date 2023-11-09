export default function removeSubstrings(
    string: string,
    substrings: string[]
  ) {
    // Loop through each substring in the array
    for (const substring of substrings) {
      // Find the index of the substring to be removed
      let index = string.indexOf(substring);
  
      // Loop until all occurrences of the substring are removed
      while (index !== -1) {
        // Use the substring() method to remove the specified substring
        const firstPart = string.substring(0, index);
        const secondPart = string.substring(
          index + substring.length
        );
        string = firstPart + secondPart;
  
        // Find the next index of the substring to be removed
        index = string.indexOf(substring);
      }
    }
  
    // Return the resulting string after removing all substrings
    return string;
  }
  