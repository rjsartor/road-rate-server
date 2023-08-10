'use strict';

const mongoose = require('mongoose');

const PlateSchema = new mongoose.Schema({
  plateNumber: { 
    type : String, 
    required: true, 
  },
  carType: {
    type: String,
    default: ''
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  plateState: { // US state (like MA)
    type: String, 
    required: true,
  },
  karma: {
    type: Number,
  },
  numberOfReviews: {
    type: Number,
  },
  isOwned: {
    type: Boolean,
    default: false
  }
});

PlateSchema.index({ plateNumber: 1, plateState: 1, }, {unique: true, dropDups: true, partialFilterExpression: {plateState: {$exists: true} }});
PlateSchema.set({ autoIndex: false });
mongoose.set('debug', false);

PlateSchema.on('index', function(error) {
  console.log('error 49', error.message);
});

const Plate = mongoose.model('Plate', PlateSchema);

Plate.createIndexes({plateNumber : 1, plateState : 1 },  function(err, result) {
  return (result);
});

Plate.on('index', function (err) {
  if (err) console.error('index creation', err); // error occurred during index creation
});

PlateSchema.set('toJSON', {
  virtuals: true, 
  transform: (doc, result) => {
    delete result._id; //This is the reviewId
    delete result.__v;
  },
});

module.exports = mongoose.model('Plate', PlateSchema);