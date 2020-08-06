const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Token = require('../models/token');
const saltRounds = 8;

//Random number generator for creating token
const {v4:uuidv4} = require('uuid');

//accessing database to create new hashed password and store it with email  
module.exports.signUp = async (credential) => {
    // const { email, password } = req.body;
    let user = await User.findOne({ email : credential.email });
    if (user) {
        return false;
    } 
        else {
        credential.password = await bcrypt.hash(credential.password, saltRounds);
        user = await User.create(credential);
        return user;
        }
  
}

//accessing database to compare shared password with existing password for a given user id
module.exports.login = async (credentials) => {
    const user = await User.findOne({ email : credentials.email }).lean();
    if (!user) { 
        return false; 
    };
    const passwordMatch = await bcrypt.compare(credentials.password, user.password);
    if (passwordMatch == false) { 
        return false; 
    } else {
        const newToken = await Token.create({ token: uuidv4(), userId : user._id });
        return newToken; 
    }; 
}

//accessing database to remove the token
module.exports.logout = async (credentials) => {
    const success = await Token.findOne({ token: credentials });
    if (!success) {
        return false;
    } else {
        await Token.deleteOne({ token: credentials });
        return true;
    };
}

// Access database to compare the tokens and update the new hashed password for matched token
module.exports.changePassword = async (auth, password) => {
    const foundToken = await Token.findOne({ token : auth });
    if (!foundToken) {
        return false;
    } else {
        try {
            password = await bcrypt.hash(password, saltRounds);
            await User.updateOne({ _id : foundToken.userId }, { $set: { 'password' : password}});
            return true;
        } catch (e) {
            throw e;
        }
        
    };
}