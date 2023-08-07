import { Worker } from "worker_threads";
import EditStream from "./editStream.js";
import { CommentMessage } from "../workers/generateComments/types.js";
import { SuggestionMessage } from "../workers/handleEdit/types.js";
import { EditResponseMessage } from "../workers/types.js";

export enum WorkerRole {
  "EditGetter",
  "EditHandler",
  "CommentGetter",
}
export enum StreamStatus {
  "EDIT" = "ReceivedEdit",
  "COMMENT" = "ReceivedComments",
  "SUGGEST" = "ReceivedAllSuggestions",
}
export type WorkerTuple = [Worker, WorkerRole];
export type WorkerMap = Map<string, WorkerTuple>;
export type StreamMap = Map<string, EditStream>;
export interface Footnote {
  offset: number;
  body: string;
  id: string;
}

export interface EditRequest {
  content: string;
  footnotes: Footnote[];
  shouldGenerateComments: boolean;
}
export type PartialMessage =
  | SuggestionMessage
  | CommentMessage
  | EditRequest
  | EditResponseMessage;

export type StreamMessage =
  | EditResponseMessage
  | SuggestionMessage
  | CommentMessage;
