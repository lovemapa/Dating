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
    serviceRatings: { type: Number, default: 0 },
    userRatings: { type: Number, default: 0 },
    date: { type: Number }

})

bookingModelSchema.set('toObject', { virtuals: true });
bookingModelSchema.set('toJSON', { virtuals: true });
bookingModelSchema.virtual('avgratings', {
    ref: 'user',
    localField: 'userId',
    foreignField: '_id',
})
var virtualCount = bookingModelSchema.virtual('Ratings');
virtualCount.get(function () {
    if (!this.avgratings || this.avgratings.length === 0) return 0;
    let totalReviews = this.avgratings.length;
    let rating = 0;
    this.avgratings.forEach(review => {
        rating = rating + review.userRatings
    });
    let avrageRate = rating / totalReviews;
    return parseFloat(avrageRate.toFixed(1));
})



module.exports = mongoose.model('booking', bookingModelSchema);