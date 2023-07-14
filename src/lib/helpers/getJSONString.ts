/**
 * Finds and parses JSON from within a string.
 * if no valid JSON exists within the string, it returns undefined
 * @param str
 * @returns
 */
export default function getJSONString(str?: string) {
  if (
    str === undefined ||
    !str.includes("{") ||
    !str.includes("}") ||
    !str.includes("[") ||
    !str.includes("]")
  )
    return undefined;

  const firstCurlIndex = str.indexOf("{");
  const firstSquareIndex = str.indexOf("[");
  let jsonStartIndex = 0;
  let jsonEndIndex = 0;
  if (firstCurlIndex < firstSquareIndex) {
    const lastCurlIndex = str.lastIndexOf("}");
    jsonStartIndex = firstCurlIndex;
    jsonEndIndex = lastCurlIndex;
  } else if (firstCurlIndex > firstSquareIndex) {
    const lastSquareIndex = str.lastIndexOf("]");
    jsonStartIndex = firstSquareIndex;
    jsonEndIndex = lastSquareIndex;
  }
  const maybeJSONString = str.substring(jsonStartIndex, jsonEndIndex + 1);
  try {
    const json = JSON.parse(maybeJSONString);
    return json;
  } catch (error) {
    // not valid JSON
    return undefined;
  }
}
