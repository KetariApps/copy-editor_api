import { Suggestion } from "../requestEdits.js";

export default function diff(
  originalContent: string,
  payload: { suggestion: string; index: number }
): Suggestion | false {
  const base = originalContent.slice(
    payload.index,
    payload.index + payload.suggestion.length
  );
  return (
    base !== payload.suggestion && {
      originalSubstring: base,
      index: payload.index,
      replacement: payload.suggestion,
    }
  );
}
