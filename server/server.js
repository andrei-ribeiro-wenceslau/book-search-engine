// Import necessary modules and packages
const express = require('express'); // Express.js web application framework
const { ApolloServer } = require('apollo-server-express'); // Apollo Server for creating a GraphQL server
const path = require('path'); // Node.js path module for working with file and directory paths

// Import custom middleware for authentication
const { authMiddleware } = require('./utils/auth');

// Import GraphQL type definitions, resolvers, and database connection configuration
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

// Define the port for the server to listen on (default: 3001)
const PORT = process.env.PORT || 3001;

// Create an Express application
const app = express();

// Create an Apollo Server for GraphQL using type definitions and resolvers
const server = new ApolloServer({
  typeDefs, // GraphQL type definitions
  resolvers, // GraphQL resolvers for handling queries and mutations
  context: authMiddleware, // Custom middleware for handling authentication
});

// Configure Express to parse URL-encoded and JSON request bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// If the application is in production, serve the client/build directory as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

// Define a route for the root URL ("/") to serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Asynchronous function to start the Apollo Server
const startApolloServer = async () => {
  // Start the Apollo Server
  await server.start();
  // Apply the Apollo Server middleware to the Express app
  server.applyMiddleware({ app });

  // When the database connection is open, start listening on the specified port
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
};

// Call the function to start the Apollo Server
startApolloServer();
