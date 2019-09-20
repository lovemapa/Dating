const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var serviceModelSchema = new Schema({
    email: { type: String, unique: true },
    contact: { type: String, default: '' },
    username: { type: String, unique: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    twitterId: { type: String, default: '' },
    password: { type: String },
    gender: { type: String, enum: ['male', 'female'] },
    height: { type: Number },
    bustSize: { type: Number },
    cupSize: { type: Number },
    waistSize: { type: Number },
    hipSize: { type: Number },
    language: [{ type: String }],
    photos: [{ type: String }],
    verificationPhotos: [{ type: String }],
    status: { type: Number },
    date: { type: Number },
    profilePic: { type: String, default: '/default.png' },
    ratings: { type: Number }

})

serviceModelSchema.set('toObject', { virtuals: true });
serviceModelSchema.set('toJSON', { virtuals: true });
serviceModelSchema.virtual('avgratings', {
    ref: 'booking',
    localField: '_id',
    foreignField: 'serviceId',
    options: { select: "ratings" }
})
var virtualCount = serviceModelSchema.virtual('serviceRatings');
virtualCount.get(function () {
    console.log(this.avgratings);

    if (!this.avgratings || this.avgratings.length === 0) return 0;
    let totalReviews = this.avgratings.length;
    let rating = 0;
    this.avgratings.forEach(review => {
        rating = rating + review.ratings
    });
    let avrageRate = rating / totalReviews;
    return avrageRate;

})
module.exports = mongoose.model('service', serviceModelSchema);