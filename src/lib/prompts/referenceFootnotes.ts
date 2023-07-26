import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from "openai";
import { Footnote } from "../../workers/requestEdits.js";

export default function referenceFootnotes(footnotes: Footnote[]) {
  const footnoteLibrary = footnotes.map(({ body, id }) => `${id}:\n\n${body}`);
  const message: ChatCompletionRequestMessage = {
    role: ChatCompletionRequestMessageRoleEnum.Assistant,
    content: `FOOTNOTES:\n\n\n${footnoteLibrary}`,
  };
  return message;
}
