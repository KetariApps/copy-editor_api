import { workerData } from "worker_threads";
import { encode } from "gpt-3-encoder";
import findSubstringIndices from "./findSubstringIndicies.js";
import splitStringAtPositions from "./splitStringAtPositions.js";
import removeSubstrings from "./removeSubstrings.js";
import diffSuggestion from "./diff.js";
import sendMessageToMainProcess from "../lib/sendMessageToMainProcess.js";
import { HandleEditWorkerData } from "./types.js";
import diff from "./diff.js";

const {
  originalVersion,
  editedVersion,
  footnotes,
  workerId,
}: HandleEditWorkerData = workerData;

if (footnotes !== undefined) {
  // find the position of the footnotes in the content
  const footnotePositions = footnotes.map((footnote) => {
    const ref = `|${footnote.id}|`;
    const originalIndex = findSubstringIndices(originalVersion, ref)[0];
    const newIndex = findSubstringIndices(editedVersion, ref)[0];
    return { ...footnote, newIndex, originalIndex };
  });

  const footnoteRefs = footnotes.map(({ id }) => `|${id}|`);

  const encodedSuggestions = splitStringAtPositions(
    editedVersion,
    footnotePositions.map(({ newIndex }) => newIndex)
  ).map((substring) => {
    const parsedPlaintext = removeSubstrings(substring, footnoteRefs);
    return encode(parsedPlaintext);
  });

  const plaintextOriginal = removeSubstrings(originalVersion, footnoteRefs);

  const encodedOriginal = encode(plaintextOriginal);

  diff(encodedOriginal, encodedSuggestions, footnotes, (message) =>
    sendMessageToMainProcess(message)
  );
} else {
  // handle the case of simple text where there are no footnotes in the user's request

  const encodedSuggestion = encode(editedVersion);
  const encodedOriginal = encode(originalVersion);
  diffSuggestion(encodedOriginal, [encodedSuggestion], footnotes, (message) =>
    sendMessageToMainProcess(message)
  );
}

sendMessageToMainProcess({ type: "done", workerId });
