//aici incepe aplicatia
require("dotenv").config({ path: "variables.env" }); //ne asiguram ca env var sunt disponibile
const createServer = require("./createServer");
const db = require("./db");

const server = createServer();

//
//
server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  deeds => {
    console.log(`server pornit ete aci: http:/localhost:${deeds.port}`);
  }
);
