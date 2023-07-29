import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from "openai";

const preserveFootnotesMessage: ChatCompletionRequestMessage = {
  role: ChatCompletionRequestMessageRoleEnum.System,
  content: `Footnotes will be referenced in the text by a uid. When editing the text, ensure the reference uid is in the same semantic position in the edited text. When inserting the uid into the edited text, it should be in the following format:
    
    "This is some edited text|uid goes here|."`,
};

export default preserveFootnotesMessage;
