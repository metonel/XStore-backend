//aici incepe aplicatia, asta ii express
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "variables.env" }); //ne asiguram ca env var sunt disponibile
const createServer = require("./createServer");
const db = require("./db");

const server = createServer();

//middleware pt cookies (JWT)
server.express.use(cookieParser());
//decode token
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    //atasam userId-ul la req pt requesturile viitoare
    req.userId = userId;
  }
  next();
});
//populeaza userul la orice request
server.express.use(async (req, res, next) => {
  //daca nu e logat useru
  if (!req.userId) return next();
  const user = await db.query.user(
    {
      where: {
        id: req.userId //req.userId l-am populat cu userul in middlewareul de mai sus
      }
    },
    "{id, permissions, email, name}"
  );
  req.user = user;
  next();
});

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  res => {
    console.log(`server pornit ete aci: http:/localhost:${res.port}`);
  }
);
