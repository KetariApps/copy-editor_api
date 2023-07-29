import { PartialMessage } from "./types.js";

const buildSSEResponse = (partialMessage: PartialMessage) => {
  const completeResponse = JSON.stringify({
    ...partialMessage,
    timestamp: Date.now(),
  });

  return completeResponse;
};
export default buildSSEResponse;
