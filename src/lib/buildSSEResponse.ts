import { CommentMessage } from "../workers/generateComments/types.js";
import { BatchSuggestionMessage, SuggestionMessage } from "../workers/types.js";
import { EditRequest } from "./types.js";

const buildSSEResponse = (partialMessage: SuggestionMessage | CommentMessage | EditRequest | BatchSuggestionMessage) => {
  const completeResponse = JSON.stringify({
    ...partialMessage,
    timestamp: Date.now(),
  });

  return completeResponse;
};
export default buildSSEResponse;
