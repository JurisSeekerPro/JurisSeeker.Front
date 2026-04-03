import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";

const httpLink = createHttpLink({
  uri: "http://localhost:5001/graphql/", 
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export function Providers({ children }) {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </ApolloProvider>
  );
}