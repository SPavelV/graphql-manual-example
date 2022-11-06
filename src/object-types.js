const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

// Создаем схему, используя язык схем GraphQL
const schema = buildSchema(`
  type RandomDie {
    numSides: Int!
    rollOnce: Int!
    roll(numRolls: Int!): [Int]
  }

  type Query {
    getDie(numSides: Int): RandomDie
  }
`);

// Этот класс реализует тип RandomDie GraphQL

class RandomDie {
  constructor(numSides) {
    this.numSides = numSides;
  }

  rollOnce() {
    return 1 + Math.floor(Math.random() * this.numSides);
  }

  roll({ numRolls }) {
    const output = [];
    for (let i = 0; i < numRolls; i++) {
      output.push(this.rollOnce());
    }

    return output;
  }
}

// Корень предоставляет конечные точки API верхнего уровня
const root = {
  getDie: ({ numSides }) => {
    return new RandomDie(numSides || 6);
  },
};

const app = express();
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);

app.listen(4000);

console.log(`Running a GraphQL API server at http://localhost:4000/graphql`);


// {
//   getDie(numSides: 6) {
//     rollOnce
//     roll(numRolls: 3)
//   }
// }
