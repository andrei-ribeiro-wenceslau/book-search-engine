const { AuthenticationError } = require('apollo-server-express')
const { User, Book } = require('../models')
const { signToken } = require('../utils/auth');
const { sign } = require('jsonwebtoken');

const resolvers = {

    Query: {
       
        me: async (parent, args, context) => {
            if (context.user) {

                return User.findOne({ _id: context.user._id })
            }
            throw new AuthenticationError('You must be logged in to access this information.')
        }
    }

}