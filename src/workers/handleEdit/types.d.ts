import { Footnote } from "../../types.js";

export interface SuggestionMessage {
  type: "suggestion";
  suggestion: string;
  originalSubstring: string;
  insertionIndex: number;
  endingFootnote?: Footnote;
}
export interface SequentialChange {
  comparisonIndex: number;
  token: number;
}
export interface HandleEditWorkerData {
  originalVersion: string;
  editedVersion: string;
  footnotes?: Footnote[] | undefined;
  workerId: string;
}
