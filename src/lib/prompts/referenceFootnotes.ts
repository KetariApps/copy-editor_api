import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from "openai";
import { Anchor } from "../types.js";

export default function referenceFootnotes(footnotes: Anchor[]) {
  const footnoteLibrary = footnotes.map(({ body, id }) => `${id}:\n\n${body}`);
  const message: ChatCompletionRequestMessage = {
    role: ChatCompletionRequestMessageRoleEnum.Assistant,
    content: `FOOTNOTES:\n\n\n${footnoteLibrary}`,
  };
  return message;
}
