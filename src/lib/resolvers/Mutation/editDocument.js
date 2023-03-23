import { encode } from "gpt-3-encoder";
import diff from "../../helpers/diff.js";
import { systemFoundations } from "../../prompts/sysFoundations.js";

// do any necessary pre-processing of the document
function processContent(content) {
  // preprocess content
  // check the tokens in the content
  const encoded = encode(content);
  console.log(encoded.length);

  // do something based on the length -- ie, split paragraphs, summarization, etc

  // etc
  const processed = content;

  return { processed, encoded };
}

// concatenate the diff so that sequential changes and not-changes are single entities
function concatDiff(diff) {
  return diff;
}

async function storeDiff(diff) {
  // send the diff somewhere and return the ID

  const diffId = "";
  return diffId;
}

export default async function EditDocument(_, { content }, context) {
  const { openai } = context;

  const { processed, encoded: encodedContent } = processContent(content);

  // build the gpt request
  const messages = [
    ...systemFoundations.copyEditor,
    { role: "user", content: processed },
  ];

  // get the response
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages,
  });

  const editedContent = response.data.choices[0].message.content;

  // measure the diff between response and original
  const encodedEditedContent = encode(editedContent);
  const editDiff = diff(encodedContent, encodedEditedContent);

  const concatenatedDiff = concatDiff(editDiff);

  // store the diff somewhere and return the id
  const diffId = await storeDiff(concatenatedDiff);

  return diffId;
}
