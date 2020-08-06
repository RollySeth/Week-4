const mongoose = require('mongoose');

const Note = require('../models/note');
const Token = require('../models/token');
const User = require('../models/user');

module.exports = {};

//validate token returned to user
module.exports.validateToken = async (token) => {
    const foundToken = await Token.findOne({ token : token });
    if (!foundToken) {
        return false;
    } else {
        const user = await User.findOne({ _id : foundToken.userId });
        return user._id;
    };
}


// Create New Note
module.exports.createNote = async (note, userId) => {
    const newNote = await Note.create({ 'text' : note, 'userId' : userId });
    return newNote;  
}

//Search notes by user id 
module.exports.getNotes = async (userId) => {
    const notes = await Note.find({ userId : userId });
    return notes;
}

//search a given note by noteid for a specific user
module.exports.getNote = async (noteId, userId) => {
        if(mongoose.Types.ObjectId.isValid(noteId)){
            const note = await Note.findOne({ _id : noteId, userId : userId }).lean();
        return note;
        }
        else {
            throw new createError(400, `NoteId '${noteId}' not found`)
        }     
}
