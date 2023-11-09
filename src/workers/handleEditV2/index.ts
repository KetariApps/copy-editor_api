import { workerData } from "worker_threads";
import sendMessageToMainProcess from "../lib/sendMessageToMainProcess.js";
import {
  HandleEditWorkerData,
  Diff,
  SuggestionMessage,
  SuggestionWithAnchor,
} from "./types.js";
import lDiggityDiff from "./lib/lDiggityDiff.js";
import { splitStringOnAnchors } from "./lib/splitStringOnAnchors.js";

const {
  originalVersion,
  editedVersion,
  anchors,
  workerId,
}: HandleEditWorkerData = workerData;

/**
 * 1.a
 * Get the set of minimal changes required to transform the original version to the edited version
 */
const changeSequence: Diff[] = lDiggityDiff(originalVersion, editedVersion);

/**
 * 1.b
 * Split the new version into substrings on the positions of all anchors (footnotes, etc)
 */
const suggestionSubstrings: SuggestionWithAnchor[] = splitStringOnAnchors(
  editedVersion,
  anchors
);

/**
 * 2.a
 * Split the suggestion substrings into sequences of stringified tokens
 */
//  const tokenizedSuggestionStrings: TokenizedSuggestionWithAnchor[] =  tokenizeSuggestionSubstrings(suggestionSubstrings)

/**
 * 3.a
 * Map the changes in the change sequence to the tokenized suggestions so that the user receives changes as tokens
 * rather than individual character changes.
 */

//  const tokenChanges = mapTokenChanges(originalVersion, tokenizedSuggestionStrings, changeSequence)

/**
 * 4.a
 * Format the changes as suggestion messages and send to the main process
 */
changeSequence.forEach((change) => {
  const message: SuggestionMessage = formatChangeAsMessage(change);
  sendMessageToMainProcess(message);
});

sendMessageToMainProcess({ type: "done", workerId });
