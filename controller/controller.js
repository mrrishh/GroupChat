const models = require('../model/index.js'),
    usersFile = require('../helpers/users'),
    groupFile = require('../helpers/user_groups'),
    jsonwebtoken = require("jsonwebtoken");

const get_error_response = (e) => {
    let err_response = {
        'message': e.message,
        'status_code': app_constants.http_status_codes.res_code_bad_request
    }
    if (e && e.status_code) {
        err_response.status_code = e.status_code;
    }
    return err_response;
};

/**
 * @param headers: {authorization}
 * @returns success: calls next middleware
 * @returns error: {@http response}
 * @description  Authorize request before actual call
 * @author - Rishabh Nandwal
 */
exports.authorize = () => {
    return async (req, res, next) => {
        try {
            if (!req || !req.headers.authorization || !req.headers.handle) {
                let error = new Error(app_constants.res_invalid_params);
                error.status_code = app_constants.res_code_invalid_params;
                console.log(error);
                throw error;
            }
            else {
                const token = req.headers.authorization;
                const verifiedToken = jsonwebtoken.verify(token, app_constants.JWT_SECRET, { expiresIn: '1d' });
                let verifyToken = await usersFile.findUserByToken(token, req.headers.handle);
                if (!verifyToken) return new http_response({ 'status_code': app_constants.http_status_codes.res_code_unauthorize, 'message': app_constants.invalid_token }).unauthorized(res);
                return next();
            }
        } catch (error) {
            console.log(error)
            return new http_response(get_error_response(error)).bad_request(res);
        }

    }
}

/**
 * @param req => body: {handle,password}
 * @returns {@http response}
 * @description  Log in user if exist, generate token and register it against user in mongo,
 *                also checks if user is already logged in or not
 * @author - Rishabh Nandwal
 */
exports.login = async (req, res) => {
    try {
        const user_data = await usersFile.login(req.body.handle, req.body.password);
        if (user_data.loggedIn) {
            return new http_response({ 'status_code': app_constants.http_status_codes.res_code_success, 'message': user_data.message, 'data': user_data.data }).ok(res);
        } else {
            return new http_response(
                { 'status_code': app_constants.http_status_codes.res_code_bad_request, 'message': user_data.message, 'data': user_data.data }).bad_request(res);

        }
    } catch (error) {
        console.log(error)
        return new http_response(get_error_response(error)).bad_request(res);
    }
};

/**
 * @param req => body: {handle}
 * @returns {@http response}
 * @description  Log out user, invalid the token and deregister it against user in mongo,
 *                also checks if user is already logged out or not
 * @author - Rishabh Nandwal
 */

exports.logout = async (req, res) => {
    try {
        const user_data = await usersFile.logout(req.headers.handle, req.headers.authorization);
        return new http_response({ 'status_code': app_constants.http_status_codes.res_code_success, 'message': user_data.message, 'data': user_data.data }).ok(res);
    } catch (error) {
        console.log(error)
        return new http_response(get_error_response(error)).bad_request(res);
    }
};


/**
 * @param req => query param: {search}
 * @returns {@http response}
 * @description  Find all the user whose handle and name starts with seach query
 * @author - Rishabh Nandwal
 */
exports.getUser = async (req, res) => {
    try {
        if (!req || !req.query.search) {
            let error = new Error(app_constants.res_invalid_params);
            error.status_code = app_constants.res_code_invalid_params;
            console.log(error);
            throw error;
        }
        let result_json = await usersFile.getUser(req.query.search);
        console.log("[controller][getUser]Success", result_json)
        return new http_response({ 'status_code': app_constants.http_status_codes.res_code_success, 'message': result_json.message, 'data': result_json.data }).ok(res);
    } catch (error) {
        console.log(error)
        return new http_response(get_error_response(error)).bad_request(res);
    }
}

/**
 * @param req => body: {name,handle,password,phone,email}
 * @param headers => role_name
 * @returns {@http response }
 * @description Create new user via Admin login token and role. 
 * @author - Rishabh Nandwal
 */
exports.createUser = async (req, res) => {
    try {
        if (!req || !req.headers.role_name || !req.body.name || !req.headers.handle || !req.body.password || !req.body.email) {
            let error = new Error(app_constants.res_invalid_params);
            error.status_code = app_constants.res_code_invalid_params;
            console.log(error);
            throw error;
        }
        if (req.headers.role_name != app_constants.admin_role) {
            return new http_response({'status_code':app_constants.http_status_codes.res_code_forbidden,'message': app_constants.invalid_permission}).forbidden(res);
        } else {
            let user = {
                "name": req.body.name,
                "handle": req.headers.handle,
                "password": req.body.password,
                "phone": req.body.phone,
                "email": req.body.email,
            };
            console.log(user);
            const data = await usersFile.createUser(user);
            return new http_response({ 'status_code': app_constants.http_status_codes.res_code_success, 'message': data.message, 'data': data.data }).ok(res);
        }

    } catch (error) {
        console.log(error)
        return new http_response(get_error_response(error)).bad_request(res);
    }
}

/**
 * @param req => body: {edit_body:{name,handle,password,phone,email},edited_user_handle}
 * @param headers => role_name
 * @returns {@http response }
 * @description Edit user via Admin login token and role. 
 * @author - Rishabh Nandwal
 */
exports.editUser = async (req, res) => {
    try {
        if (!req || !req.headers.role_name || !req.headers.handle || !req.body.edit_user) {
            let error = new Error(app_constants.res_invalid_params);
            error.status_code = app_constants.res_code_invalid_params;
            console.log(error);
            throw error;
        }
        if (req.headers.role_name != app_constants.admin_role) {
            return new http_response({'status_code':app_constants.http_status_codes.res_code_forbidden,'message': app_constants.invalid_permission}).forbidden(res);

        } else {
            var edit_user = {
                "name": req.body.edit_body.name,
                "handle": req.body.edit_body.handle,
                "password": req.body.edit_body.password,
                "phone": req.body.edit_body.phone,
                "email": req.body.edit_body.email,
                "edited_user_handle": req.headers.headers
            };
            console.log(edit_user);
            const data = await usersFile.editUser(edit_user);
            return new http_response({ 'status_code': app_constants.http_status_codes.res_code_success, 'message': data.message, 'data': data.data }).ok(res);
        }

    } catch (error) {
        console.log(error);
        return new http_response(get_error_response(error)).bad_request(res);
    }
}