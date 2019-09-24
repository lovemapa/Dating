const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var favouriteModelSchema = new Schema({
    userId: { type: Schema.ObjectId, ref: 'user' },
    serviceId: { type: Schema.ObjectId, ref: 'service' },

})



module.exports = mongoose.model('favourite', favouriteModelSchema);