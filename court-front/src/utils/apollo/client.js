// src/apollo/client.js
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: "http://localhost:5233/graphql", // адрес вашего GraphQL сервера
  }),
  cache: new InMemoryCache(),
});