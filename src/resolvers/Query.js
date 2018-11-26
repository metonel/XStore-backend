const { forwardTo } = require("prisma-binding"); //
const { hasPermission } = require("../utils");

const Query = {
  //   dogs(parent, args, ctx, info) {
  //     global.dogs = global.dogs || []; //pt ca [Dog]!, raspunsu la query tre sa fie array, nu tre sa fie null si daca inca nu is elemente, trebuie sa fie cel putin goala
  //     return global.dogs;
  //   }

  //   items(parent, args, ctx, info) {
  //       return ctx.db.query.item();
  //   }
  //se poate si ca sus, si returneaza promise, da e mai ok asa

  // async items(parent, args, ctx, info) {
  //   const items = await ctx.db.query.items();
  //   return items;
  // },
  items: forwardTo("db"),
  item: forwardTo("db"),
  itemsConnection: forwardTo("db"),
  me(parent, args, ctx, info) {
    //ii functie, dar scrisa cu shorthand ES6
    //verificam daca exista user logat
    if (!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user(
      {
        //in prisma.graphql este query-ul user()
        where: { id: ctx.request.userId }
      },
      info
    ); //in info query-ul primeste ce date se cer inapoi
  },
  async users(parent, args, ctx, info) {
    //log in
    if (!ctx.request.uderId) {
      console.log("sdfvfgsg");
      // throw new Error("Trebuie sa fii logat");
    }
    //verifica da userul are permisiunea sa verifice userii
    hasPermission(ctx.request.user, ["USER"]);
    //query userii
    return ctx.db.users({}, info);
  }
};

module.exports = Query;
