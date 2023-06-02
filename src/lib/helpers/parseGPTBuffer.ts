import getJSONString from "./getJSONString.js";

type ChatCompletionStreamResponseDataDelta =
  | {
      role: "assistant";
    }
  | { content: string }
  | {};
interface ChatCompletionStreamResponseData {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: [
    {
      delta: ChatCompletionStreamResponseDataDelta;
      index: number;
      finish_reason: null | string;
    }
  ];
}
// Example function to parse the buffer
export default function parseGPTBuffer(buffer: Buffer) {
  // Parse the buffer according to your specific data format
  // Example: Assume the buffer contains JSON data
  const chunk = buffer.toString("utf8");

  const data = chunk
    // get the data lines
    .split("data: ")
    .filter((str) => str.trim() !== "")
    // parse the json from the data lines
    .map((str) => {
      const jsonString = getJSONString(str);
      if (jsonString == undefined) return undefined;
      const data: ChatCompletionStreamResponseData = JSON.parse(jsonString);
      return data;
    })
    // return only the data object which has content
    .filter(
      (data): data is ChatCompletionStreamResponseData =>
        data !== undefined && "content" in data.choices[0].delta
    )[0];

  return data !== undefined ? data : undefined;
}
