const Query = {
  //   dogs(parent, args, ctx, info) {
  //     global.dogs = global.dogs || []; //pt ca [Dog]!, raspunsu la query tre sa fie array, nu tre sa fie null si daca inca nu is elemente, trebuie sa fie cel putin goala
  //     return global.dogs;
  //   }

  //   items(parent, args, ctx, info) {
  //       return ctx.db.query.item();
  //   }
  //se poate si ca sus, si returneaza promise, da e mai ok asa

  async items(parent, args, ctx, info) {
    const items = await ctx.db.query.items();
    return items;
  }
};

module.exports = Query;
