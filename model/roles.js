const mongoose = require('mongoose');
let roles_schema = new mongoose.Schema({
    role_name: String,
    actions: Array
}, { timestamps: true });

roles_schema.set('toJSON', {
    transform: (doc, result) => {
        return {
            ...result,
            id: result._id
        };
    }
});

let roles = mongoose.model('Roles', roles_schema);
module.exports = roles;