import { workerData } from "worker_threads";
import { encode } from "gpt-3-encoder";
import findSubstringIndices from "./findSubstringIndicies.js";
import splitStringAtPositions from "./splitStringAtPositions.js";
import removeSubstrings from "./removeSubstrings.js";
import sendMessageToMainProcess from "../lib/sendMessageToMainProcess.js";
import diff from "./diff.js";
import { HandleEditWorkerData, LevensteinDiff, SuggestionWithAnchor, TokenizedSuggestionWithAnchor } from "./types.js";

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
 const changeSequence: LevensteinDiff = levensteinDiff(originalVersion, editedVersion)

/**
 * 1.b
 * Split the new version into substrings on the positions of all anchors (footnotes, etc)
 */
 const suggestionSubstrings: SuggestionWithAnchor[] = splitOnAnchors(editedVersion, anchors) 

 /**
  * 2.a
  * Split the suggestion substrings into sequences of stringified tokens
  */
 const tokenizedSuggestionStrings: TokenizedSuggestionWithAnchor[] =  tokenizeSuggestionSubstrings(suggestionSubstrings)

 /**
  * 3.a 
  * Map the changes in the change sequence to the tokenized suggestions so that the user receives changes as tokens 
  * rather than individual character changes.
  */

 const tokenChanges = mapTokenChanges(originalVersion, tokenizedSuggestionStrings, changeSequence)



sendMessageToMainProcess({ type: "done", workerId });
