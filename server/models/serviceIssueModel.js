const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var serviceIssueModelSchema = new Schema({
    serviceId: { type: Schema.ObjectId, ref: 'service' },
    screenshot: { type: String, },
    issue: { type: String }

})



module.exports = mongoose.model('serviceIssue', serviceIssueModelSchema);