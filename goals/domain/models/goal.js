const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GoalSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    subtype: {
        type: String,
        required: false
    },
    value: {
        type: Number,
        required: true
    },
    current: {
        type: Number,
        required: false
    },
    objective_date: {
        type: Date,
        required: false
    },
    month: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Goals', GoalSchema);
