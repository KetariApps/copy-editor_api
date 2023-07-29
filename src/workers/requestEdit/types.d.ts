import { Footnote } from "../../lib/types.ts";

export interface SuggestionMessage {
  type: "suggestion";
  suggestion: string;
  originalSubstring: string;
  insertionIndex: number;
  endingFootnote?: Footnote;
}
export interface RequestEditWorkerData {
  content: string;
  footnotes?: Footnote[];
  shouldGenerateComments: boolean;
  workerId: string;
}
export interface SequentialChange {
  comparisonIndex: number;
  token: number;
}
