const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { TRAINS_DATA } = require('../data/trainsData');

// Equivalent of Django's train_static_list view
router.get('/train_static_list', (req, res) => {
  res.json(TRAINS_DATA);
});

// Equivalent of Django's train_list view (reads from the DB via the ORM)
router.get('/trains', (req, res) => {
  const trains = db.prepare('SELECT * FROM trains').all();

  const data = trains.map((train) => {
    const classes = db
      .prepare('SELECT class_type, price, available_seats FROM train_classes WHERE train_id = ?')
      .all(train.id)
      .map((c) => ({
        type: c.class_type,
        price: c.price,
        available: c.available_seats,
      }));

    const seats = db
      .prepare('SELECT seat_number, is_booked FROM seats WHERE train_id = ?')
      .all(train.id)
      .map((s) => ({
        seat_number: s.seat_number,
        is_booked: Boolean(s.is_booked),
      }));

    return {
      train_id: train.train_id,
      name: train.name,
      number: train.number,
      from: train.from_station,
      to: train.to_station,
      departure: train.departure,
      arrival: train.arrival,
      duration: train.duration,
      type: train.train_type,
      rating: train.rating,
      amenities: JSON.parse(train.amenities),
      classes,
      seats,
    };
  });

  res.json(data);
});

module.exports = router;
