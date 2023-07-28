export default function splitStringOnTokens(
  inputString: string,
  dividers: string[]
) {
  // Escape special characters in dividers and join them with '|' to create a regex pattern
  const dividerPattern = dividers
    .map((divider) => escapeRegExp(divider))
    .join("|");
  // Create a regex pattern using the divider pattern and add a capturing group to retain the dividers in the result
  const regexPattern = `(${dividerPattern})`;
  // Split the input string using the regex pattern and filter out empty strings
  const substrings = inputString
    .split(new RegExp(regexPattern))
    .filter((substring) => !dividers.includes(substring));

  // Return only the first n substrings if n is less than the total number of substrings
  return substrings;
}

// Helper function to escape special characters in a string to be used in a regular expression
function escapeRegExp(str: string) {
  return str.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");
}
