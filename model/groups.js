const mongoose = require('mongoose');
let groups_schema = new mongoose.Schema({
    group_name: {
        type: String,
        required: true
    },
    created_by: {
        type: String,
        required: true
    },
    admin: {
        type: String,
        required: true
    },
    users: []
}, { timestamps: true });

groups_schema.set('toJSON', {
    transform: (doc, result) => {
        return {
            ...result,
            id: result._id
        };
    }
});

let groups = mongoose.model('Groups', groups_schema);
module.exports = groups;