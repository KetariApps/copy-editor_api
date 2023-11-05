import { Anchor } from "../../lib/types.ts";

export interface SuggestionMessage {
  type: "suggestion";
  suggestion: string;
  originalSubstring: string;
  insertionIndex: number;
  endingFootnote?: Anchor;
}
export interface SequentialChange {
  comparisonIndex: number;
  token: number;
}
export interface HandleEditWorkerData {
  originalVersion: string;
  editedVersion: string;
  anchors?: Anchor[] | undefined;
  workerId: string;
}

export type Operation = "insert" | "delete" | "replace";
export interface LevensteinDiff {
  old: string;
  new: string;
  operation: Operation;
  offset: number;
}
export interface SuggestionWithAnchor {
  content: string;
  anchor: Anchor;
}
export interface Token {
  string: string;
  id: number;
}
export interface TokenizedSuggestionWithAnchor {
  tokenizedSuggestion: Token[];
  anchor: Anchor;
}
