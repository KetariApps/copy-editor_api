import express, { Request, Response } from 'express';

const app = express();

// Enable parsing of request bodies
app.use(express.json());

// SSE endpoint
app.get('/sse', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send initial event to establish SSE connection
  res.write('event: connected\n\n');

  // Store the response object for later use
  const userResponse = res;

  // Handle the request from the user
  handleUserRequest(req, userResponse);
});

// Handle user request and stream response
// add openai api request and prompting
function handleUserRequest(req: Request, res: Response) {
  const userMessage = req.body.message; // Assuming the request contains a "message" property

  // Perform any processing or logic based on the user request
  // For simplicity, we'll just echo the message back in uppercase

  const uppercaseMessage = userMessage.toUpperCase();

  // Create a response event to send to the user
  const responseEvent = {
    type: 'response',
    message: uppercaseMessage,
  };

  // send a response back to the user when a complete chunk has been edited
  // a complete chunk is when a series of tokens ceases to differ from the original text

  // Send the response event as an SSE message to the user
  res.write(`event: response\ndata: ${JSON.stringify(responseEvent)}\n\n`);

  // Close the SSE connection after sending the response
  res.end();
}

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
