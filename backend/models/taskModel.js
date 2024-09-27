const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: String,
    description: String,
    completed: Boolean,
    date: Date,
    // user: { type: Schema.Types.ObjectId, ref: 'User' }
})

const taskModel = new mongoose.model('Task',taskSchema);
module.exports = taskModel;