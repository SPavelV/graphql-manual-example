const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

// Создаем схему, используя язык GraphQL
const schema = buildSchema(`
  type Query {
    quoteOfTheDay: String
    random: Float!
    rollThreeDice: [Int]
    rollDice(numDice: Int!, numSides: Int): [Int]
  }
`);

// Корень предоставляет функцию разрешения для каждой конечной точки API

const root = {
  quoteOfTheDay: () => {
    return Math.random < 0.5 ? 'Take it easy' : 'Salvation lies within';
  },

  random: () => {
    return Math.random();
  },

  rollThreeDice: () => {
    return [1, 2, 3].map((_) => 1 + Math.floor(Math.random() * 6));
  },

  rollDice: ({ numDice, numSides }) => {
    const output = [];
    for (let i = 0; i < numDice; i++) {
      output.push(1 + Math.floor(Math.random() * (numSides || 6)));
    }

    return output;
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
