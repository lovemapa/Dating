const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var userModelSchema = new Schema({
    email: { type: String, unique: true },
    countryCode: { type: String },
    nickName: { type: String, unique: true },
    password: { type: String },
    gender: { type: String, enum: ['male', 'female'] },
    profilePic: { type: String, default: '/default.png' },
    token: { type: String },
    date: { type: Number, },
    area: { type: String },
    state: { type: String },
    callType: { type: String, enum: ['outcall', 'incall'] },
    favourites: [{ type: Schema.ObjectId, ref: 'service' }],
    isDeleted: { type: Number, default: 0 }

})

userModelSchema.set('toObject', { virtuals: true });
userModelSchema.set('toJSON', { virtuals: true });
userModelSchema.virtual('allRatings', {
    ref: 'booking',
    localField: '_id',
    foreignField: 'userId'
})

var virtualCount = userModelSchema.virtual('userRatings');
virtualCount.get(function () {

    if (!this.allRatings || this.allRatings.length === 0) return 0;
    let totalReviews = this.allRatings.length;
    let rating = 0;
    this.allRatings.forEach(review => {
        rating = rating + review.userRatings
    });
    let avrageRate = rating / totalReviews;
    return parseFloat(avrageRate.toFixed(1));

})


module.exports = mongoose.model('user', userModelSchema);

