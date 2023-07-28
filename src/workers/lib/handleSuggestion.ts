import { encode } from "gpt-3-encoder";
import findSubstringIndices from "../../lib/helpers/findSubstringIndicies.js";
import { splitStringAtPositions } from "../../lib/helpers/splitStringAtPositions.js";
import removeSubstrings from "../../lib/helpers/removeSubstrings.js";
import sendMessageToUser from "./sendMessageToUser.js";
import diffSuggestion from "./diffSuggestion.js";
import type { Footnote } from "./types.d.ts";

const handleSuggestion = (
  originalText: string,
  suggestion: string | undefined,
  footnotes: Footnote[] | undefined
) => {
  if (suggestion === undefined) return;

  if (footnotes !== undefined) {
    // find the position of the footnotes in the content
    const footnotePositions = footnotes.map((footnote) => {
      const ref = `|${footnote.id}|`;
      const originalIndex = findSubstringIndices(originalText, ref)[0];
      const newIndex = findSubstringIndices(suggestion, ref)[0];
      return { ...footnote, newIndex, originalIndex };
    });

    const footnoteRefs = footnotes.map(({ id }) => `|${id}|`);

    const encodedSuggestions = splitStringAtPositions(
      suggestion,
      footnotePositions.map(({ newIndex }) => newIndex)
    ).map((substring) => {
      const parsedPlaintext = removeSubstrings(substring, footnoteRefs);
      return encode(parsedPlaintext);
    });

    const plaintextOriginal = removeSubstrings(originalText, footnoteRefs);
    const encodedOriginal = encode(plaintextOriginal);

    diffSuggestion(encodedOriginal, encodedSuggestions, footnotes, (message) =>
      sendMessageToUser(JSON.stringify(message))
    );
  } else {
    // handle the case of simple text where there are no footnotes in the user's request

    const encodedSuggestion = encode(suggestion);
    const encodedOriginal = encode(originalText);
    diffSuggestion(encodedOriginal, [encodedSuggestion], footnotes, (message) =>
      sendMessageToUser(JSON.stringify(message))
    );
  }
};

export default handleSuggestion;
