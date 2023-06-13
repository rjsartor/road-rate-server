'use strict';
const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    default: '',
  },
  username : { 
    type: String, 
    required: true, 
    unique: true 
  },
  password : { 
    type: String, 
  },
  email : {
    type: String,
    required: true, 
    unique: true ,
  },
  authId: {
    type: String,
  }
});

UserSchema.set('toJSON', {
  virtuals: true, 
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
    delete result.password; //delete plaintext password so it doesn't come back in the response
  }
});

UserSchema.methods.serialize = function() {
  return {
    username: this.username,
    name: this.name || '',
    id: this._id,
  };
};

UserSchema.set('timestamps', true);

// Creates validatePassword method
UserSchema.methods.validatePassword = function(incomingPassword) {
  // return bcrypt.compare(incomingPassword, this.password);
  return true;
};

UserSchema.statics.hashPassword = function(incomingPassword) {
  // const digest = bcrypt.hash(incomingPassword, 10);
  return incomingPassword;
};

module.exports = mongoose.model('User', UserSchema);