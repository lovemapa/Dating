const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var serviceModelSchema = new Schema({
    email: { type: String, unique: true },
    contact: { type: String, default: '' },
    username: { type: String, unique: true },
    bodyType: { type: String },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    eyesColor: { type: String },
    twitterId: { type: String, default: '' },
    password: { type: String },
    gender: { type: String, enum: ['male', 'female'] },
    height: { type: String },
    bustSize: { type: String },
    cupSize: { type: String },
    waistSize: { type: String },
    hipSize: { type: String },
    language: [{ type: String }],
    photos: [{ type: String }],
    verificationPhotos: [{ type: String }],
    status: { type: Number, default: 1 }, // 0 (offline)  1 (online)
    date: { type: Number },
    profilePic: { type: String, default: '/default.png' },
    measurments: [{ type: String }],
    isDeleted: { type: Number, default: 0 }


})

serviceModelSchema.set('toObject', { virtuals: true });
serviceModelSchema.set('toJSON', { virtuals: true });
serviceModelSchema.virtual('avgratings', {
    ref: 'booking',
    localField: '_id',
    foreignField: 'serviceId',
    options: { select: "serviceRatings" }
})
var virtualCount = serviceModelSchema.virtual('serviceRatings');
virtualCount.get(function () {
    if (!this.avgratings || this.avgratings.length === 0) return 0;
    let totalReviews = this.avgratings.length;
    let rating = 0;
    this.avgratings.forEach(review => {
        rating = rating + review.serviceRatings
    });
    let avrageRate = rating / totalReviews;
    return parseFloat(avrageRate.toFixed(1));

})
module.exports = mongoose.model('service', serviceModelSchema);