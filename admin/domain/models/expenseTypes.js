const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const expenseTypeSchema = new Schema({
    name: {
        type: String,
        required: true
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
        required: false
    }
});

module.exports = mongoose.model('ExpenseType', expenseTypeSchema);
