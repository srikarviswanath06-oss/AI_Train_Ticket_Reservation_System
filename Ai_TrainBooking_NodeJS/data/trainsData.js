// Ported from the original Django Train/views.py TRAINS_DATA + generate_seats()

function generateSeats(trainId, count) {
  const seats = [];
  for (let i = 1; i <= count; i++) {
    seats.push({
      seat_number: `${trainId}-S${i}`,
      is_booked: false,
    });
  }
  return seats;
}

const TRAINS_DATA = [
  {
    id: 'T001',
    name: 'Rajdhani Express',
    number: '12301',
    from: 'Chennai',
    to: 'Mumbai',
    departure: '06:15 AM',
    arrival: '10:30 PM',
    duration: '16h 15m',
    type: 'Superfast',
    rating: 4.8,
    amenities: ['wifi', 'food', 'charging', 'ac'],
    classes: [
      { type: '1AC', price: 3250, available: 12 },
      { type: '2AC', price: 2150, available: 24 },
      { type: '3AC', price: 1450, available: 45 },
      { type: 'SL', price: 680, available: 78 },
    ],
    seats: generateSeats('T001', 80),
  },
  {
    id: 'T002',
    name: 'Shatabdi Express',
    number: '12008',
    from: 'Chennai',
    to: 'Bangalore',
    departure: '08:00 AM',
    arrival: '02:45 PM',
    duration: '6h 45m',
    type: 'Superfast',
    rating: 4.9,
    amenities: ['wifi', 'food', 'charging', 'ac'],
    classes: [
      { type: 'CC', price: 850, available: 35 },
      { type: 'EC', price: 1650, available: 18 },
    ],
    seats: generateSeats('T002', 60),
  },
  {
    id: 'T003',
    name: 'Duronto Express',
    number: '12263',
    from: 'Chennai',
    to: 'Delhi',
    departure: '11:30 AM',
    arrival: '08:15 AM',
    duration: '20h 45m',
    type: 'Non-stop',
    rating: 4.7,
    amenities: ['wifi', 'food', 'charging', 'ac'],
    classes: [
      { type: '1AC', price: 4250, available: 8 },
      { type: '2AC', price: 2850, available: 20 },
      { type: '3AC', price: 1950, available: 38 },
    ],
    seats: generateSeats('T003', 70),
  },
  {
    id: 'T004',
    name: 'Intercity Express',
    number: '12640',
    from: 'Chennai',
    to: 'Coimbatore',
    departure: '02:15 PM',
    arrival: '09:30 PM',
    duration: '7h 15m',
    type: 'Express',
    rating: 4.5,
    amenities: ['charging', 'ac'],
    classes: [
      { type: '2AC', price: 980, available: 28 },
      { type: '3AC', price: 680, available: 52 },
      { type: 'SL', price: 340, available: 95 },
    ],
    seats: generateSeats('T004', 100),
  },
  {
    id: 'T005',
    name: 'Vande Bharat Express',
    number: '20668',
    from: 'Chennai',
    to: 'Mysore',
    departure: '05:45 AM',
    arrival: '12:30 PM',
    duration: '6h 45m',
    type: 'Premium',
    rating: 4.9,
    amenities: ['wifi', 'food', 'charging', 'ac'],
    classes: [
      { type: 'CC', price: 1250, available: 42 },
      { type: 'EC', price: 2350, available: 16 },
    ],
    seats: generateSeats('T005', 65),
  },
];

module.exports = { TRAINS_DATA, generateSeats };
