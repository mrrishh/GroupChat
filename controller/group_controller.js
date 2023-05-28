const models = require('../model/index.js'),
    usersFile = require('../helpers/users'),
    groupFile = require('../helpers/user_groups'),
    chatMessageFile = require('../helpers/chat_message'),
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
 * @param req => body: {group_name,created_by_handle, @array user_handles}
 * @param headers => role_name,headers
 * @returns => {@http response }
 * @description Create a group. Can be created with the admin only or user_handles that has been passed to Array.
 * @author - Rishabh Nandwal
 */
exports.createGroup = async (req, res) => {
    try {
        if (!req || !req.body.group_name || !req.headers.handle || !(req.body.user_handles instanceof Array) || !req.headers.role_name) {
            let error = new Error(app_constants.res_invalid_params);
            error.status_code = app_constants.res_code_invalid_params;
            console.log(error);
            throw error;
        }
        if (req.headers.role_name == app_constants.admin_role) {
            return new http_response({'status_code':app_constants.http_status_codes.res_code_forbidden,'message': app_constants.invalid_permission}).forbidden(res);
        } else {
            var group = {
                "group_name": req.body.group_name,
                "created_by": req.headers.handle,
                "admin": req.headers.handle,
                'user_handles': req.body.user_handles
            };
            const data = await groupFile.createGroup(group);
            return new http_response({ 'status_code': app_constants.http_status_codes.res_code_success, 'message': data.message, 'data': data.data }).ok(res);

        }

    } catch (error) {
        console.log(error)
        return new http_response(get_error_response(error)).bad_request(res);
    }
}

/**
 * @param req => body: {group_name,handle}
 * @param headers => role_name
 * @returns => {@http response }
 * @description When deleting group, it will also remove all the users from group and remove the group from user object in mongo
 * @author - Rishabh Nandwal
 */
exports.deleteGroup = async (req, res) => {
    try {
        if (!req || !req.body.group_name || !req.headers.role_name || !req.headers.handle) {
            let error = new Error(app_constants.res_invalid_params);
            error.status_code = app_constants.res_code_invalid_params;
            console.log(error);
            throw error;
        }
        if (req.headers.role_name == app_constants.admin_role) {
            return new http_response({'status_code':app_constants.http_status_codes.res_code_forbidden,'message': app_constants.invalid_permission}).forbidden(res);
        } else {
            var group = {
                "group_name": req.body.group_name,
                "handle": req.headers.handle
            };
            const data = await groupFile.deleteGroup(group);
            return new http_response({ 'status_code': app_constants.http_status_codes.res_code_success, 'message': data.message, 'data': data.data }).ok(res);

        }

    } catch (error) {
        console.log(error)
        return new http_response(get_error_response(error)).bad_request(res);
    }
}

/**
 * @param req => body: {group_name,handle, @array user_handles}
 * @param headers => role_name
 * @returns => {@http response }
 * @description Add all users to the group provided in the user_handles array
 * @author - Rishabh Nandwal
 */
exports.addMembersToGroup = async (req, res) => {
    try {
        if (!req || !req.body.group_name || !req.headers.role_name || !req.headers.handle || !(req.body.user_handles instanceof Array)) {
            let error = new Error(app_constants.res_invalid_params);
            error.status_code = app_constants.res_code_invalid_params;
            console.log(error);
            throw error;
        }
        if (req.headers.role_name == app_constants.admin_role) {
            return new http_response({'status_code':app_constants.http_status_codes.res_code_forbidden,'message': app_constants.invalid_permission}).forbidden(res);
        } else {
            var group_members = {
                "group_name": req.body.group_name,
                "handle": req.headers.handle,
                'users': req.body.user_handles
            };
            const data = await groupFile.addMembers(group_members);
            return new http_response({ 'status_code': app_constants.http_status_codes.res_code_success, 'message': data.message, 'data': data.data }).ok(res);

        }

    } catch (error) {
        console.log(error)
        return new http_response(get_error_response(error)).bad_request(res);
    }
}


/**
 * @param req => body: {group_name,handle, @array user_handles}
 * @param headers => role_name
 * @returns => {@http response }
 * @description Remove all users to the group provided in the user_handles array
 * @author - Rishabh Nandwal
 */
exports.removeMembersFromGroup = async (req, res) => {
    try {
        if (!req || !req.body.group_name || !req.headers.role_name || !req.headers.handle || !(req.body.user_handles instanceof Array)) {
            let error = new Error(app_constants.res_invalid_params);
            error.status_code = app_constants.res_code_invalid_params;
            console.log(error);
            throw error;
        }
        if (req.headers.role_name == app_constants.admin_role) {
            return new http_response({'status_code':app_constants.http_status_codes.res_code_forbidden,'message': app_constants.invalid_permission}).forbidden(res);
        } else {
            var group_members = {
                "group_name": req.body.group_name,
                "handle": req.headers.handle,
                'users': req.body.user_handles
            };
            const data = await groupFile.removeMembers(group_members);
            return new http_response({ 'status_code': app_constants.http_status_codes.res_code_success, 'message': data.message, 'data': data.data }).ok(res);

        }

    } catch (error) {
        console.log(error)
        return new http_response(get_error_response(error)).bad_request(res);
    }
}

/**
 * @param req => body: {group_name, handle - user who is posting the message,message_text}
 * @returns => {@http response }
 * @description Post a message into group. Checks if user is a member of group or not
 * @author - Rishabh Nandwal
 */
exports.postMessage = async (req, res) => {
    try {
        if (!req || !req.body.group_name || !req.headers.handle || !req.body.message_text) {
            let error = new Error(app_constants.res_invalid_params);
            error.status_code = app_constants.res_code_invalid_params;
            console.log(error);
            throw error;
        }
        const group_name = req.body.group_name;

        const messagePayload = {
            messageText: req.body.message_text
        };
        const currentLoggedUser = req.headers.handle;
        console.log(group_name, messagePayload, currentLoggedUser)
        const post = await chatMessageFile.postMessage({ group_name, messagePayload, currentLoggedUser });
        console.log(post)
        global.io.sockets.in(group_name).emit('new message', { message: post });
        return new http_response({ 'status_code': app_constants.http_status_codes.res_code_success, 'message': post.message, 'data': post.data }).ok(res);

    } catch (error) {
        console.log(error)
        return new http_response(get_error_response(error)).bad_request(res);
    }
}

/**
 * @param req => query: {handle,page,limit}
 * @returns => {@http response }
 * @description Fetch all the recent conversation of a user of all the groups with pagination
 * @author - Rishabh Nandwal
 */
exports.getRecentConversation = async (req, res) => {
    try {
        if (!req || !req.query.page || !req.headers.handle || !req.query.limit) {
            let error = new Error(app_constants.res_invalid_params);
            error.status_code = app_constants.res_code_invalid_params;
            console.log(error);
            throw error;
        }
        const req_body = {
            user_handle: req.headers.handle,
            page: req.query.page,
            limit: req.query.limit
        };
        const recentConversation = await chatMessageFile.getRecentConversation(req_body);
        return new http_response({ 'status_code': app_constants.http_status_codes.res_code_success, 'message': recentConversation.message, 'data': recentConversation.data }).ok(res);

    } catch (error) {
        return new http_response(get_error_response(error)).bad_request(res);
    }
}

/**
 * @param path: {handle,page,limit}
 * @returns => {@http response }
 * @description Fetch all the recent conversation of a user of all the groups with pagination
 * @author - Rishabh Nandwal
 */
exports.getConversationByGroupHandle = async (req, res) => {
    try {
        if (!req || !req.params.page || !req.params.group_name || !req.params.limit) {
            let error = new Error(app_constants.res_invalid_params);
            error.status_code = app_constants.res_code_invalid_params;
            console.log(error);
            throw error;
        }
        const req_body = {
            group_name: req.params.group_name,
            page: req.params.page,
            limit: req.params.limit
        };
        const data = await chatMessageFile.getConversationByGroupHandle(req_body);
        return new http_response({ 'status_code': app_constants.http_status_codes.res_code_success, 'message': data.message, 'data': data.data }).ok(res);
    } catch (error) {
        console.log(error);
        return new http_response(get_error_response(error)).bad_request(res);
    }
}

/**
 * @param path: {group_name,user_handle}
 * @returns => {@http response }
 * @description When user opens a group, mark all the conversation as read for this user
 * @author - Rishabh Nandwal
 */
exports.markConversationReadByGroupName = async (req, res) => {
    try {
        if (!req || !req.body.group_name || !req.headers.handle) {
            let error = new Error(app_constants.res_invalid_params);
            error.status_code = app_constants.res_code_invalid_params;
            console.log(error);
            throw error;
        }
        const req_body = {
            group_name: req.body.group_name,
            user_handle: req.headers.handle
        }
        const data = await chatMessageFile.markConversationReadByGroupName(req_body);
        return new http_response({ 'status_code': app_constants.http_status_codes.res_code_success, 'message': data.message, 'data': data.data }).ok(res);

    } catch (error) {
        console.log(error);
        return new http_response(get_error_response(error)).bad_request(res);
    }
}