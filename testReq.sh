curl -X POST -H "Content-Type: application/json" -d '{"message": "today has been a very long day. it sarted with me trying to write a computer program and after eight or so hours Ive finally made som progrress."}' http://localhost:4000/edit

curl -N 'http://localhost:4000/sse?streamId=5'
