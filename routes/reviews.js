'use strict';

const express = require('express');
const User = require('../models/user');
const Review = require('../models/review');
const Plate = require('../models/plate');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const router = express.Router();

const getReviews = async (filter, res, next) => {
  try {
    const reviews = await Review.find(filter).sort({ 'createdAt': -1 });
    res.status(200).json(reviews);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

/* ========== GET ALL REVIEWS ========== */
router.get('/', async (req, res, next) => {
  const { number, state } = req.query;
  const re = new RegExp(number, 'i');
  let filter = {};

  if (number && !state) {
    filter = {
      plateNumber: re,
    };
  } else if (!number && state) {
    filter = {
      plateState: state,
    };
  } else if (number && state) {
    filter = {
      plateState: state,
      plateNumber: re,
    };
  }

  await getReviews(filter, res, next);
});

/* ========== GET FILTERED REVIEWS BY PLATEID (for public plate) ========== */
router.get('/plate/:plateId', async (req, res, next) => {
  console.log('plate/:plateId')
  const plateId = req.params.plateId;
  await getReviews({ plateId }, res, next);
});

/* ========== GET FILTERED REVIEWS LEFT BY SPECIFIC USER ========== */
router.get('/:userId', async (req, res, next) => {
  const userId = req.params.userId;
  console.log('by user');

  try {
    await User.find({ id: userId });
    const reviews = await Review.find({ reviewerId: userId });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

/* ========== GET ONE REVIEW BY ID ========== */
router.get('/:id', async (req, res, next) => {
  let { id } = req.params;
  console.log('by id')

  if (!id || id === '') {
    const err = {
      message: 'Missing review `id`',
      reason: 'MissingContent',
      status: 400,
      location: 'get',
    };
    return next(err);
  }

  try {
    const review = await Review.findById(id);
    res.json(review);
  } catch (err) {
    next(err);
  }
});

/* ========== POST/CREATE A REVIEW ========== */
router.post('/', jsonParser, async (req, res, next) => {
  try {
    const { plateNumber, reviewerId, rating, message, plateState } = req.body;

    const newReview = {
      plateNumber: plateNumber.toUpperCase(),
      reviewerId,
      message,
      isPositive: rating,
      plateState,
    };

    const plate = await Plate.findOne({ plateNumber, plateState });
    
    if (!plate) {
      let karma = (rating === 'true') ? 1 : -1;
      
      const newPlate = await Plate.create({ plateNumber, plateState, karma });
      newReview.plateId = newPlate._id;
    } else {
      newReview.plateId = plate._id;
      if (rating === 'true') {
        await Plate.findByIdAndUpdate(plate._id, { $inc: { karma: 1 } });
      } else {
        await Plate.findByIdAndUpdate(plate._id, { $inc: { karma: -1 } });
      }
    }

    const createdReview = await Review.create(newReview);
    res.status(201).json(createdReview);
  } catch (err) {
    next(err);
  }
});

/* ========== UPDATE A REVIEW ========== */
router.put('/:id', jsonParser, async (req, res, next) => {
  const { id } = req.params;
  const { ownerResponse } = req.body;

  try {
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { ownerResponse },
      { new: false }
    );
    res.json(updatedReview);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
