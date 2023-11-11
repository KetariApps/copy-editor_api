export interface EditResponseMessage {
  type: "edit";
  originalVersion: string;
  editedVersion: string;
  footnotes?: Anchor[] | undefined;
  shouldGenerateComments: boolean;
}
