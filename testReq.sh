#!/bin/bash

# Set the message text in a variable
message_text="today has been a very long day. it started with me trying to write a computer program and after eight or so hours I've finally made some progress."

# Create the JSON object with the message variable
message="{\"message\":\"$message_text\"}"

# Send text to the edits endpoint and retrieve SSE key
stream_id=$(curl -X POST -H "Content-Type: application/json" -d "$message" https://copy.ketari.dev/api/edit | sed -n 's/.*"streamId":"\([^"]*\)".*/\1/p')

# Make request to SSE endpoint using the obtained SSE key
curl -N "https://copy.ketari.dev/api/sse?streamId=${stream_id}"

# Replace {PORT} with the actual port number you're using
