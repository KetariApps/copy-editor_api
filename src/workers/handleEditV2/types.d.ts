import { Anchor } from "../../lib/types.ts";

export interface SuggestionMessage {
  type: "suggestion";
  operation: Operation;
  content?: string | null;
  ref: { substring: string; index: number };
  endingFootnote?: Anchor;
}

export interface BatchSuggestionMessage {
  type: "batch-suggestion";
  suggestions: SuggestionMessage[];
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

export interface Diff {
  change: string;
  operation: Operation;
  index: { old: number; change: number };
}
