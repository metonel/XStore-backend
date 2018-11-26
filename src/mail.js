const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "bc5552912750ac",
    pass: "13b6c71bbc8564"
  }
});

const makeANiceEmail = text => `
<div
  className="email"
  style="
    border: 1px solid black;
    padding: 20px;
    font-family: sans-serif;
    line-height: 2;
    font-size: 20px;
"
>
  <h2>Salutare!</h2>
  <p>${text}</p>

  <p>Toni</p>
</div>;
`;

exports.transport = transport;
exports.makeANiceEmail = makeANiceEmail;
