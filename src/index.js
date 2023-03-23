import { ApolloServer } from "apollo-server";
import path from "path";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv";
import { resolvers } from "./lib/resolvers/index.js";

//// env stuff
dotenv.config();
const { OPENAI_API_KEY } = process.env;

//// schema stuff
const typesArray = loadFilesSync(path.join("./", "*.graphql"));
const typeDefs = mergeTypeDefs(typesArray);

//// openai stuff
const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

//// start the server

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    return { req, openai };
  },
});

const shutdown = () => {
  console.log("Shutting down server");
  server.stop().then(() => {
    console.log("Server stopped");
    process.exit();
  });
};

// Listen for SIGINT signal
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
