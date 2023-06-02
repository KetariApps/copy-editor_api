import { Suggestion } from "../requestEdits.js";

export default function buildSSEEvent(sequentialSuggestions: Suggestion[]) {
  // concatenate the suggestion parts
  const originalSubstring = sequentialSuggestions
    .map((r, i) => r.originalSubstring)
    .join("");
  const replacement = sequentialSuggestions
    .map((r, i) => r.replacement)
    .join("");

  const suggestion: Suggestion = {
    originalSubstring,
    index: sequentialSuggestions[0].index,
    replacement,
  };

  // construct the event object
  const event = {
    type: "suggestion",
    suggestion,
  };
  return event;
}
