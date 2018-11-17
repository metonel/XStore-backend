const { GraphQLServer } = require("graphql-yoga");
const Mutation = require("./resolvers/Mutation");
const Query = require("./resolvers/Query");
const db = require("./db");

//creare Yoga server

function createServer() {
  return new GraphQLServer({
    typeDefs: "src/schema.graphql", //sa porneasca serverul, asta nu tre sa fie fisier gol
    resolvers: {
      Mutation, // de fapt ii Mutation: Mutation, primul ii argument pt server, al doilea ii Mutation din fisieru creat in resolvers.
      Query
    },
    resolverValidationOptions: {
      //sa nu dea ceva erori
      requireResolversForResolveType: false
    }, //12 min 12
    context: req => ({ ...req, db }) //aici expumen db la requesturi de la resolveri
  });
}

module.exports = createServer;
