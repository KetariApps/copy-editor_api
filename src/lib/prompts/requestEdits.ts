import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from "openai";

export default function requestEdits(content: string, maxTokens: number) {
  const message: ChatCompletionRequestMessage = {
    role: ChatCompletionRequestMessageRoleEnum.User,
    content: `Content:\n\n${content}\n\n\n\n--------\n\n\n\nEdit the content in less than ${maxTokens} tokens`,
  };
  return message;
}
