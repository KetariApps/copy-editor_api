import { ChatCompletionRequestMessageRoleEnum } from "openai";

export const generateCommentsUserMessage = {
  role: ChatCompletionRequestMessageRoleEnum.User,
  content: `Given the original version and edited version, summarize why the changes were made as an editor's comment.`,
};
export const generateCommentsAssistantMessages = (
  originalVersion: string,
  editedVersion: string
) => [
  {
    role: ChatCompletionRequestMessageRoleEnum.Assistant,
    content: `Original version:\n\n${originalVersion}\n\n\nEdited version:\n\n${editedVersion}`,
  },
];
