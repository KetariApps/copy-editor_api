import { Diff, SuggestionMessage } from "../workers/types.js";

export const diffToSuggestion = (
  { change, operation, index }: Diff,
  originalVersion: string
): SuggestionMessage => ({
  type: "suggestion",
  operation,
  content: change,
  ref: {
    index: index.old,
    substring: originalVersion[index.old],
  },
});
