import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { gql } from 'graphql-tag';
import prisma from '../../lib/prisma';

const typeDefs = gql`
  type Post {
    id: Int!
    title: String!
    content: String!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    posts: [Post!]!
    post(id: Int!): Post
  }

  type Mutation {
    createPost(title: String!, content: String!): Post!
    updatePost(id: Int!, title: String, content: String): Post!
    deletePost(id: Int!): Post
  }
`;

const resolvers = {
  Query: {
    posts: () => prisma.post.findMany(),
    post: (_, { id }) => prisma.post.findUnique({ where: { id } }),
  },
  Mutation: {
    createPost: (_, { title, content }) => prisma.post.create({ data: { title, content } }),
    updatePost: (_, { id, title, content }) => prisma.post.update({ where: { id }, data: { title, content } }),
    deletePost: (_, { id }) => prisma.post.delete({ where: { id } }),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

export default startServerAndCreateNextHandler(server);