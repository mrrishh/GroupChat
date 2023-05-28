const user_mongo = require('../model/users');
(async () => {
    const adminUsername = 'admin';
    const adminPassword = 'adminpassword';

    let admin = await user_mongo.findOne({ handle: adminUsername });
    if (admin == null) {
        let insert_json = {
            "name": adminUsername,
            "handle": adminUsername,
            "password": adminPassword,
            "phone": 7828553569,
            "email": 'rishabhnandwal3@gmail.com',
            "role_name": app_constants.admin_role
        }
        await user_mongo(insert_json).save();
    }
})()
