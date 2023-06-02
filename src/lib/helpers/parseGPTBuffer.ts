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

  const lines = chunk.split("\n");
  const eventLine = lines.find((line) => line.startsWith("event:"));
  const dataLine = lines.find((line) => line.startsWith("data:"));

  const type = eventLine ? eventLine.split(":")[1].trim() : null;
  const data: ChatCompletionStreamResponseData = dataLine
    ? JSON.parse(dataLine.substr(5).trim())
    : null;

  console.log(
    "content" in data.choices[0].delta && data.choices[0].delta.content
  );

  return { type, data };
}
