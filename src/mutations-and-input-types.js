const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

// Создаем схему, используя язык схем GraphQL
const schema = buildSchema(`
  input MessageInput{
    content: String
    author: String
  }

  type Message {
    id: ID!
    content: String
    author: String
  }

  type Query {
    getMessage(id: ID!): Message
  }

  type Mutation {
    createMessage(input: MessageInput): Message
    updateMessage(id: ID!, input: MessageInput): Message
  }
`);

// Если бы в Message были сложные поля, мы бы поместили их в этот объект.

class Message {
  constructor(id, { content, author }) {
    this.id = id;
    this.content = content;
    this.author = author;
  }
}

//  Сопоставляет имя пользователя с содержимым
var fakeDatabase = {};

// Корень предоставляет конечные точки API верхнего уровня
const root = {
  getMessage: ({ id }) => {
    if (!fakeDatabase[id]) {
      throw new Error(`no message exists with id ${id}`);
    }
    return new Message(id, fakeDatabase[id]);
  },

  createMessage: ({ input }) => {
    // Создаем случайный идентификатор для нашей "базы данных".
    const id = require('crypto').randomBytes(10).toString('hex');
    fakeDatabase[id] = input;
    return new Message(id, input);
  },

  updateMessage: ({ id, input }) => {
    if (!fakeDatabase[id]) {
      throw new Error('no message exists with id' + id);
    }
    // Это заменяет все старые данные, но некоторым приложениям может потребоваться частичное обновление.
    fakeDatabase[id] = input;
    return new Message(id, input);
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


// mutation {
//   createMessage(input: {
//     author: "andy",
//     content: "hope is a good thing",
//   }) {
//     id
//   }
// }

var author = 'andy';
var content = 'hope is a good thing';
var query = `mutation CreateMessage($input: MessageInput) {
  createMessage(input: $input) {
    id
  }
}`;

fetch('/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({
    query,
    variables: {
      input: {
        author,
        content,
      }
    }
  })
})
  .then(r => r.json())
  .then(data => console.log('data returned:', data));