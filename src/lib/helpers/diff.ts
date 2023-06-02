import { decode } from "gpt-3-encoder";
import { Suggestion } from "../requestEdits.js";

export default function diff(
  tokenizedContent: number[],
  payload: { tokens: number[]; index: number }
): Suggestion | false {
  const baseToken = tokenizedContent.slice(
    payload.index,
    payload.index + payload.tokens.length
  );
  return (
    baseToken !== payload.tokens && {
      originalSubstring: decode(baseToken),
      index: payload.index,
      replacement: decode(payload.tokens),
    }
  );
}
