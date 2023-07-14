import { ChatCompletionRequestMessage } from "openai";

function getCurrentDate() {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return dateStr;
}

export const global: ChatCompletionRequestMessage[] = [
  {
    role: "system",
    content: `The current date is ${getCurrentDate()} and you were last updated in September 2021.
    ---
    Hello ChatGPT, please follow all instructions, precisely.`,
  },
];
