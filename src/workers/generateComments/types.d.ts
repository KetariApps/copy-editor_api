export interface CommentMessage {
  type: "comment";
  comment?: string | undefined;
  originalVersion: string;
  editedVersion: string;
}
export interface GenerateCommentsWorkerData {
  originalVersion: string;
  editedVersion: string;
  workerId: string;
}
