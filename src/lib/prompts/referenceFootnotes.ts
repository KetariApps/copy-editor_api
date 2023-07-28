import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from "openai";
import type { Footnote } from "../../workers/lib/types.d.ts";

export default function referenceFootnotes(footnotes: Footnote[]) {
  const footnoteLibrary = footnotes.map(({ body, id }) => `${id}:\n\n${body}`);
  const message: ChatCompletionRequestMessage = {
    role: ChatCompletionRequestMessageRoleEnum.Assistant,
    content: `FOOTNOTES:\n\n\n${footnoteLibrary}`,
  };
  return message;
}
