//conectarea la db-ul prisma, sa o putem interoga cu JS

const { Prisma } = require("prisma-binding");

const db = new Prisma({
  typeDefs: "src/generated/prisma.graphql", //fisieru generat de prisma, unde gasim toata logica ce o putem aplica pe db (interogarea in JS)
  endpoint: process.env.PRISMA_ENDPOINT,
  secret: process.env.PRISMA_SECRET,
  debug: false //face un console.log la query si mutation
});

module.exports = db;
