// Import necessary modules and packages
const { AuthenticationError } = require("apollo-server-express");
const { User, Book } = require("../models"); 
const { signToken } = require("../utils/auth"); 
const { sign } = require("jsonwebtoken");

// Define the resolvers object
const resolvers = {
  // Define the Query section of resolvers
  Query: {
    // Define a resolver for the "me" query
    me: async (parent, args, context) => {
      // Check if the user is authenticated (logged in)
      if (context.user) {
        // If authenticated, return the User object with the given user's _id
        return User.findOne({ _id: context.user._id });
      }
      // If not authenticated, throw an AuthenticationError
      throw new AuthenticationError(
        "You must be logged in to access this information."
      );
    },
  },

  // Define the Mutation section of resolvers
  Mutation: {
    // Define a resolver for the "addUser" mutation
    addUser: async (parent, args) => {
      // Create a new user based on the provided arguments
      const user = await User.create(args);
      // Sign a JWT token for the user
      const token = signToken(user);
      // Return the token and user object
      return { token, user };
    },

    // Define a resolver for the "loginUser" mutation
    loginUser: async (parent, { email, password }) => {
      // Find a user with the provided email
      const user = await User.findOne({ email });

      // If no user is found with the email, throw an AuthenticationError
      if (!user) {
        throw new AuthenticationError("No user found with this email address");
      }

      // Check if the provided password is correct for the user
      const correctPw = await user.isCorrectPassword(password);

      // If the password is incorrect, throw an AuthenticationError
      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      // Sign a JWT token for the authenticated user and return it along with the user object
      const token = signToken(user);
      return { token, user };
    },

    // Define a resolver for the "saveBook" mutation
    saveBook: async (parent, { bookData }, context) => {
      // Check if the user is authenticated
      if (context.user) {
        // Find the user and add the provided bookData to their "savedBooks" array
        const user = await User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $addToSet: {
              savedBooks: bookData,
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );
        // Return the updated user object
        return user;
      }

      // If the user is not authenticated, throw an AuthenticationError
      throw new AuthenticationError("You need to be logged in!");
    },

    // Define a resolver for the "removeBook" mutation
    removeBook: async (parent, { bookId }, context) => {
      // Check if the user is authenticated
      if (context.user) {
        // Find the user and remove the book with the provided "bookId" from their "savedBooks" array
        const user = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          {
            new: true,
            runValidators: true,
          }
        );
        // Return the updated user object
        return user;
      }

      // If the user is not authenticated, throw an AuthenticationError
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

// Export the resolvers object for use in Apollo Server
module.exports = resolvers;