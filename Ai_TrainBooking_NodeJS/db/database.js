// Ported from Django Train/models.py + Train/migrations/0001_initial.py
// Uses Node's built-in node:sqlite module (no native compilation needed,
// unlike better-sqlite3) as the equivalent of Django's ORM + sqlite3 backend.
// Requires Node.js 22.5+ (stable without a flag since Node 23.4 / 22.13).

const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const { TRAINS_DATA } = require('../data/trainsData');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'db.sqlite3');
const db = new DatabaseSync(DB_PATH);

// Equivalent of Django's `python manage.py migrate`
db.exec(`
  CREATE TABLE IF NOT EXISTS trains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    number TEXT NOT NULL,
    from_station TEXT NOT NULL,
    to_station TEXT NOT NULL,
    departure TEXT NOT NULL,
    arrival TEXT NOT NULL,
    duration TEXT NOT NULL,
    train_type TEXT NOT NULL,
    rating REAL NOT NULL,
    amenities TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS train_classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_id INTEGER NOT NULL REFERENCES trains(id) ON DELETE CASCADE,
    class_type TEXT NOT NULL,
    price INTEGER NOT NULL,
    available_seats INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS seats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_id INTEGER NOT NULL REFERENCES trains(id) ON DELETE CASCADE,
    seat_number TEXT NOT NULL,
    is_booked INTEGER NOT NULL DEFAULT 0
  );
`);

// Equivalent of populating data through the Django admin: seed once from
// the same TRAINS_DATA the static endpoint uses, so /trains returns real
// rows instead of an empty table.
function seedIfEmpty() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM trains').get();
  if (count > 0) return;

  const insertTrain = db.prepare(`
    INSERT INTO trains (train_id, name, number, from_station, to_station, departure, arrival, duration, train_type, rating, amenities)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertClass = db.prepare(`
    INSERT INTO train_classes (train_id, class_type, price, available_seats)
    VALUES (?, ?, ?, ?)
  `);
  const insertSeat = db.prepare(`
    INSERT INTO seats (train_id, seat_number, is_booked)
    VALUES (?, ?, ?)
  `);

  db.exec('BEGIN');
  try {
    for (const t of TRAINS_DATA) {
      const result = insertTrain.run(
        t.id,
        t.name,
        t.number,
        t.from,
        t.to,
        t.departure,
        t.arrival,
        t.duration,
        t.type,
        t.rating,
        JSON.stringify(t.amenities)
      );
      const dbTrainId = result.lastInsertRowid;

      for (const c of t.classes) {
        insertClass.run(dbTrainId, c.type, c.price, c.available);
      }
      for (const s of t.seats) {
        insertSeat.run(dbTrainId, s.seat_number, s.is_booked ? 1 : 0);
      }
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

seedIfEmpty();

module.exports = db;
