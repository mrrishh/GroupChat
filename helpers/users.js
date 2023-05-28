
const models = require('../model/index.js'),
    users_mongo = require('../model/users'),
    jsonwebtoken = require("jsonwebtoken");



exports.findUserByToken = async (token, handle) => {
    try {
        let user = await users_mongo.findOne({ 'token': token, 'handle': handle });
        if (user == null) {
            return;
        } else {
            return user.token;
        }
    } catch (error) {
        console.log(error)
        return error;
    }
}

exports.login = async (handle, password) => {
    try {
        let user_data = await users_mongo.findOne({ "handle": handle, "password": password })
        if (user_data == null) {
            return { loggedIn: false, message: app_constants.invalid_user };
        }
        else {
            if (user_data.token && user_data.token != 1) {
                return { loggedIn: true , message: app_constants.already_logged_in }
            }
            const token = await jsonwebtoken.sign({ user: handle }, app_constants.JWT_SECRET);
            await users_mongo.updateOne({ "handle": handle }, { token: token });
            let result_json = {
                "user_name": user_data.name,
                "token": token,
                "handle": user_data.handle,
                "role_name": user_data.role_name,
                "phone": user_data.phone,
                "email": user_data.email,
                "friends_list": user_data.friends,
                "groups": user_data.groups
            }
            return { loggedIn:true,data: result_json };
        }

    } catch (error) {
        console.log(error)
        return error;
    }
}

exports.logout = async (handle, token) => {
    try {
        let user_data = await users_mongo.findOne({ "handle": handle })
        if (user_data == null) {
            return { message: "User has not registered" };
        }
        else {
            if (user_data.token && user_data.token == 1) {
                return { message: "You are already logged out" }
            }
            await users_mongo.updateOne({ "handle": handle, token: token }, { token: 1 });
            return { message: "Success", data: "Logged out" };
        }

    } catch (error) {
        console.log(error)
        return error;
    }
}

exports.getUser = async (search_query) => {
    try {
        // const regex = new RegExp('^[0-9]*(?:.[0-9]{0,' + limit + '})?$');
        const where = {
            $or: [{ handle: new RegExp('^' + search_query) }, { name: new RegExp('^' + search_query) }],
            $and : [{handle: { $ne: 'admin' }}]
        }
        let found_users = await users_mongo.find(where).select('handle id -_id');;
        if (found_users.length == 0) {
            return { message: app_constants.no_user_found }
        } else {
            return { data: found_users };
        }
    } catch (error) {
        console.log(error)
        return error;
    }
}

exports.createUser = async (obj) => {
    try {
        console.log("[helpers][users][createUser]Start", obj)
        let user_data = await users_mongo.findOne({ "handle": obj.handle });
        if (user_data == null) {
            obj.role_name = app_constants.default_role;
            let insert_res = new users_mongo(obj).save();
            if (insert_res) return { message: app_constants.user_created };
        } else {
            return { message: app_constants.user_already_exist };
        }
    } catch (error) {
        console.log(error)
        return error;
    }

}

exports.editUser = async (obj) => {
    try {
        let user_data = await users_mongo.findOne({ "handle": obj.edited_user_handle });
        if (user_data == null) {
            return { message: app_constants.no_user_found };
        } else {
            let to_update_json = {
                ...(obj && obj.name) && { name: obj.name },
                ...(obj && obj.handle) && { handle: obj.handle },
                ...(obj && obj.password) && { password: obj.password },
                ...(obj && obj.phone) && { phone: obj.phone },
                ...(obj && obj.email) && { email: obj.email },
            }
            let updated_user = await users_mongo.findOneAndUpdate({ handle: obj.edited_user_handle }, to_update_json, { 'useFindAndModify': false });
            return { message: app_constants.user_modified, data:updated_user };
        }
    } catch (error) {
        console.log(error)
        return error;
    }

}




/**
 * @param {String} id, user id
 * @return {Object} User profile object
 */
exports.getUserByHandle = async (handle) => {
    try {
        const user = await users_mongo.findOne({ handle: handle });
        return user;
    } catch (error) {
        console.log(error)
        return error;
    }
}

/**
 * @return {Array} List of all users
 */
exports.getUsers = async function () {
    try {
        const users = await users_mongo.find();
        return users;
    } catch (error) {
        console.log(error)
        return error;
    }
}

/**
 * @param {Array} handles, string of user handles
 * @return {Array of Objects} users list
 */
exports.getUserByHandles = async function (handles) {
    try {
        const users = await users_mongo.find({ handle: { $in: handles } });
        return users;
    } catch (error) {
        console.log(error)
        return error;
    }
}

/**
 * @param {String} handle - handle of user
 * @return {Object} - details of action performed
 */
exports.deleteByUserByHandle = async function (handle) {
    try {
        const result = await users_mongo.remove({ handle: handle });
        return result;
    } catch (error) {
        console.log(error)
        return error;
    }
}
exports.checkRolesExisted = async (role_name) => {
    models.roles.findOne({ "name": role_name }, function (err, doc) {
        if (err) {
            res.json(err);
        }
    })
}

