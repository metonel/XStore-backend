const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { transport, makeANiceEmail } = require("../mail");
const { randomBytes } = require("crypto"); //crypto ii built in in node
const { promisify } = require("util"); //utilitar ce ia callback based fct(randomBytes ii callback) si le transforma in promise fct

const mutations = {
  //   createDog(parent, args, ctx, info) {
  //     global.dogs = global.dogs || []; //pt ca [Dog]!, raspunsu la query tre sa fie array, nu tre sa fie null si daca inca nu is elemente, trebuie sa fie cel putin goala
  //     //create a dog
  //     const newDog = { name: args.name };
  //     global.dogs.push(newDog);
  //     return newDog;
  //   }
  async createItem(parent, args, ctx, info) {
    //putem sa ne uitam in prisma.graphql sa vedem toate mutatiile ce le putem folosi. le gasim la type Mutation {...}
    if (!ctx.request.userId) {
      throw new Error("Trebuie sa fii autentificat pentru a adauga produse");
    }
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          //creare relatie intre item si user
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
          ...args
          //   echivalent cu:
          //     title: args.title,
          //     description: args.description,
          //     etc...
        }
      },
      info //ia din query-ul din frontend si transmite ce campuri trebuiesc returnate
    );
    return item;
  },
  updateItem(parent, args, ctx, info) {
    //o copie a update-urilor
    const data = { ...args };
    //scoaterea id-ului
    delete data.id;
    //update method
    return ctx.db.mutation.updateItem(
      {
        data: data,
        where: {
          id: args.id
        }
      },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    //gasirea produsului
    const item = await ctx.db.query.item({ where }, `{id, title}`); //in loc de info aici am trimis manual ce campuri ne trebuiesc intoarse
    //
    //stergerea
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    //hash la parola
    const password = await bcrypt.hash(args.password, 10); //bcrypt e functie async, punem SALT 10
    //salveaza userul in db
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args, //in functie de ce am definit in model
          password: password,
          permissions: { set: ["USER"] } //e definit un enum pt permissions, aici il setam implicit ca USER pt inceput
        }
      },
      info
    );

    //creare JWT, pentru a se autentifica automat dupa inregistrare
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    //salvare JWT ca si cookie ca raspuns. cu cookie tokenul va merge de fiecare data
    ctx.response.cookie("token", token, {
      httpOnly: true, //sa nu poate fi accesat cookie-ul prin javascript, pt securitae
      maxAge: 1000 * 60 * 60 * 24 * 2 //2 zile
    });
    //returneaza userul catre browser
    return user;
  },

  async signin(parent, { email, password }, ctx, info) {
    //am facut destructure din args
    //verifica daca exista user cu acest email
    const user = await ctx.db.query.user({ where: { email } }); //where: email = email
    if (!user) {
      throw new Error(`Nu exista user cu acest email ${email}`);
    }
    //verificarea parolei
    const valid = await bcrypt.compare(password, user.password); //password din formul din frontend, o hash-uieste si caompa cu parola userului gasit dupa email
    if (!valid) {
      throw new Error("Parola invalida");
    }
    //generarea token-ului
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    //salvam cookie-ul
    ctx.response.cookie("token", token, {
      httpOnly: true, //sa nu poate fi accesat cookie-ul prin javascript, pt securitae
      maxAge: 1000 * 60 * 60 * 24 * 2 //2 zile
      //returneaza userul
    });
    return user;
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token"); //in index.js folosim cookieParser si asa avem acces la fct clearCookie
    return { message: "Te mai asteptam!" };
  },
  async requestReset(parent, args, ctx, info) {
    //verifica daca userul exista
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error(`Nu exista user cu acest email ${args.email}`);
    }
    //creaza reset token
    //randomBytes va returna un buffer cu lungimea 20
    //const randomBytesPromisified =  promisify(randomBytes); se putea si asa si apelam numa constanta jos
    const resetToken = (await promisify(randomBytes)(20)).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; //o ora
    //sau callback simplu era: const resetToken = randomBytes(20).toString('hex');
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken: resetToken, resetTokenExpiry: resetTokenExpiry }
    });
    //console.log(res);
    //trimite email cu tokenul
    const mailRes = await transport.sendMail({
      from: "toni@codeplayground.ro",
      to: user.email,
      subject: "Resetare Parola XStore",
      html: makeANiceEmail(`
      Pentru a reseta parola: 
      \n\n 
      <a href="${
        process.env.FRONTEND_URL
      }/reset?resetToken=${resetToken}">click aici</a>
      `)
    });

    return { message: "link resetare trimis" };
  },
  async resetPassword(parent, args, ctx, info) {
    //verificam daca parolele sunt la fel
    if (args.password !== args.confirmPassword) {
      throw new Error(`Parolele nu sunt la fel`);
    }
    //verifica reset token si valabilitatea
    //apelam query-ul users care ne returneaza un array cu userii, si ii filtram din array userul care are tokenul din args si a carei valoare in resetTokenExpiry este greater or equal (_gte ii filtru permis de prisma)
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });
    if (!user) {
      throw new Error("token invalid");
    }
    //hash password
    const password = await bcrypt.hash(args.password, 10);
    //save pwd
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null, //setam si tokenul invalid, sa nu se poata reseta parola din nou cu acelasi token
        resetTokenExpiry: null
      }
    });
    //generate jwt
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    //set cookie
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 2
    });
    //return user
    return updatedUser;
  }
};

module.exports = mutations;
