// src/apollo/client.js
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: "http://localhost:5001/graphql", 
  }),
  cache: new InMemoryCache(),
});