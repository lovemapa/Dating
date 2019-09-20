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
    ratings: { type: Number, default: 0 },
    favourites: [{ type: Schema.ObjectId, ref: 'service' }]

})



module.exports = mongoose.model('user', userModelSchema);