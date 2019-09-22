const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var bookingModelSchema = new Schema({
    schedule: { type: Number, required: true },
    location: [Number],
    houseName: { type: String, required: true },
    houseNumber: { type: String, required: true },
    contact: { type: String, required: true },
    userId: { type: Schema.ObjectId, ref: 'user', required: true },
    serviceId: { type: Schema.ObjectId, ref: 'service', required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'closed'], default: 'pending' },
    ratings: { type: Number, default: 0 },
    date: { type: Number }

})



module.exports = mongoose.model('booking', bookingModelSchema);