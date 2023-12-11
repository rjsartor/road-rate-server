'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const Plate = require('../models/plate');
const mongoose = require('mongoose');

const router = express.Router();
const jsonParser = bodyParser.json();

const requiredFields = ['userId', 'plateNumber', 'plateState'];

const validateFields = (fields, data) => {
  const missingFields = fields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing fields: ${missingFields.join(', ')}`);
  }
}

/* ========== GET ALL PLATES ========== */
router.get('/', async (req, res, next) => {
  try {
   
    const { number, state } = req.query.params;
    let filter = {};

    if (number && state) {
      filter = {
        plateNumber: number,
        plateState: state,
      };
    }

    const plates = await Plate.find(filter);
    console.log("plates", plates)
    return res.status(200).json(plates);
  } catch (err) {
    next(err);
  }
});

/* ===== GET ALL PLATES USING userId from client ===== */
router.get('/user/:id', async (req, res, next) => {
  try {
    const { id } = req?.params;
    if (!id) throw 'Missing user id';

    const plates = await Plate.find({ userId: id });
    return res.status(200).json(plates);
  } catch (err) {
    next(err);
  }
});

/* ========== GET ONE PLATE BY PLATE ID ========== */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req?.params;
    if (!id) throw 'Missing plate id';

    const plate = await Plate.findById(id);
    console.log('here I AM')
    console.log('plate', plate)
    return res.status(200).json(plate);
  } catch (err) {
    next(err);
  }
});

/* ========== Get Plate by State and Number ========== */
router.get('/:plateState/:plateNumber', async (req, res, next) => {
  try {
    let plateState = req.params?.plateState;
    let plateNumber = req.params?.plateNumber;

    let filter = {};
  
    filter = {
      plateState,
      plateNumber
    };

    const plate = await Plate.findOne(filter);
    return res.status(200).json(plate);
  } catch (err) {
    next(err);
  }
});

/* ========== POST A PLATE ========== */
router.post('/', jsonParser, async (req, res, next) => {
  try {
    const { plateNumber, userId, plateState, isOwned } = req?.body;

    validateFields(requiredFields, { plateNumber, plateState, userId });

    const newPlate = await Plate.create({ plateNumber, plateState, userId, isOwned });
    return res.status(201).json(newPlate);
  } catch (err) {
    next(err);
  }
});


/* ========== CLAIM A PLATE PUT/UPDATE using userId  ========== */
router.put('/:userId', async (req, res, next) => {
  const { userId } = req.params;
  const { plateNumber, plateState } = req.body;

  console.log('userId', userId)
 
  validateFields(requiredFields, { plateNumber, plateState, userId });

  try {
    const plate = await Plate.findOneAndUpdate({ plateNumber, plateState } , { userId, isOwned: true })
    return res.status(204).json(plate);
  } catch (err) {
    next(err);
  }
});

/* ========== UNCLAIM A PLATE PUT/UPDATE using userId  ========== */
router.put('/unclaim/:userId', async (req, res, next) => {
  const { userId } = req.params;
  const { plateNumber, plateState } = req.body;
  
  validateFields(requiredFields, { plateNumber, plateState, userId });

  try {
    const plate = await Plate.findOneAndUpdate(
      { plateNumber, plateState }, 
      { $unset: { userId, isOwned: false }}
    );
    return res.status(204).json(plate);
  } catch (err) {
    next(err)
  }
});

module.exports = router;