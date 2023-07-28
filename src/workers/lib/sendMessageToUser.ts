import { parentPort } from "worker_threads";

const sendMessageToUser = (message: string) => {
  if (parentPort) {
    parentPort.postMessage(message);
  } else {
    // `parentPort` is null, handle this case accordingly
    console.error("parentPort is not available");
  }
};

export default sendMessageToUser;
