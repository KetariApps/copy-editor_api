export interface Footnote {
  offset: number;
  body: string;
  id: string;
}
export interface Message {
  type: "suggestion";
  suggestion: string;
  originalSubstring: string;
  insertionIndex: number;
  endingFootnote?: Footnote;
}
export interface RequestEditsWorkerData {
  content: string;
  footnotes?: Footnote[];
}
export interface SequentialChange {
  comparisonIndex: number;
  token: number;
}
