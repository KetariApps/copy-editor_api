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
  const jsonString = str.substring(jsonStartIndex, jsonEndIndex + 1);
  return jsonString;
}
