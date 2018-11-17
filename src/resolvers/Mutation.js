const mutations = {
  //   createDog(parent, args, ctx, info) {
  //     global.dogs = global.dogs || []; //pt ca [Dog]!, raspunsu la query tre sa fie array, nu tre sa fie null si daca inca nu is elemente, trebuie sa fie cel putin goala
  //     //create a dog
  //     const newDog = { name: args.name };
  //     global.dogs.push(newDog);
  //     return newDog;
  //   }
  async createItem(parent, args, ctx, info) {
    //putem sa ne uitam in prisma.graphql sa vedem toate metodele ce le putem folosi. le gasim la type Mutation {...}
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args
          //   echivalent cu:
          //     title: args.title,
          //     description: args.description,
          //     etc...
        }
      },
      info
    );
    return item;
  }
};

module.exports = mutations;
