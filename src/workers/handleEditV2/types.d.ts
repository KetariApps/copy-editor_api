import { Anchor } from "../../lib/types.ts";

export interface SuggestionMessage {
  type: "insertion" | "replacement" | "deletion";
  suggestion?: string | null;
  ref: { substring: string; index: number };
  endingFootnote?: Footnote;
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
export interface SuggestionWithAnchor {
  content: string;
  anchor?: [string, number];
}
export interface Token {
  string: string;
  id: number;
}
export interface TokenizedSuggestionWithAnchor {
  tokenizedSuggestion: Token[];
  anchor: Anchor;
}

export enum Operation {
  "Insert",
  "Delete",
  "Replace",
}
export interface Diff {
  new: string;
  operation: Operation;
  index: { old: number; new: number };
}