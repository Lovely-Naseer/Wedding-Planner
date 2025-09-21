const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Mobile_no: { type: String, required: true },
  Wedding_Address: { type: String, required: true },
  Wedding_date_From: { type: Date, required: true },
  Wedding_date_To: { type: Date, required: true },
  Venue: { type: String, required: true },
  CardDesign: { type: String, required: true },
  Service: { type: [String], required: true },
  No_of_Guests: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Booking', bookingSchema);
