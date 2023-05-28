const mongoose = require('mongoose');
let user_schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    handle: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    token: mongoose.Schema.Types.Mixed,
    role_name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    friends: [],
    groups: []
}, { timestamps: true });

user_schema.set('toJSON', {
    transform: (doc, result) => {
        return {
            ...result,
            id: result._id
        };
    }
});

let users = mongoose.model('User', user_schema);
module.exports = users;