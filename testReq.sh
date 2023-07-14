#!/bin/bash

# Set the message text in a variable
message_text="today has been a very long day. it started with me trying to write a computer program and after eight or so hours I've finally made some progress."

# Create the JSON object with the message variable
message="{\"message\":\"$message_text\"}"

# Send text to the edits endpoint and retrieve SSE key
stream_id=$(curl -X POST -H "Content-Type: application/json" -d "$message" http://localhost:4000/edit | sed -n 's/.*"streamId":"\([^"]*\)".*/\1/p')

# Replace {PORT} with the actual port number you want to use

# Make request to SSE endpoint using the obtained SSE key
curl -N "http://localhost:4000/sse?streamId=${stream_id}"

# Replace {PORT} with the actual port number you're using
