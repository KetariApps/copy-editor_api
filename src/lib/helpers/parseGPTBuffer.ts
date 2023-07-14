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

  const dataLines = chunk
    .split("data: ")
    .filter((line) => line !== null && line.length > 0);

  const streamResponse = dataLines
    .map((dataLine) => {
      const data: ChatCompletionStreamResponseData | undefined =
        getJSONString(dataLine);
      if (
        data === undefined ||
        !("content" in data.choices[0].delta) ||
        data.choices[0].delta.content == ""
      )
        return undefined;
      return data;
    })
    .filter(
      (
        bufferJSONOrUndefined
      ): bufferJSONOrUndefined is ChatCompletionStreamResponseData =>
        bufferJSONOrUndefined !== undefined
    );

  return streamResponse[0];
}
