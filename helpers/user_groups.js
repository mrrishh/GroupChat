const groups_mongo = require('../model/groups'),
    user_mongo = require('../model/users'),
usersFile = require('./users'),
    message_mongo = require('../model/chat_message');


exports.createGroup = async (obj) => {
    try {
        const allUserHandles = [...obj.user_handles, obj.created_by];
        obj.users = allUserHandles;
        let users_data = await user_mongo.find({ handle: { $in: obj.users }, $and: [{handle :{$ne: 'admin'} }]});
        let existing_users = users_data.map(user => user.handle);
        obj.users = existing_users;
        if(!existing_users.includes(obj.created_by)) return {message : obj.created_by + " " +app_constants.no_user_found }
        let group_data = await groups_mongo.findOne({ "group_name": obj.group_name });
        if (group_data == null) {
            let insert_res = await groups_mongo(obj).save();
            if (insert_res) {
                await user_mongo.updateMany(
                    { handle: { $in: existing_users } },
                    {
                        $push: {
                            groups: obj.group_name
                        }
                    }
                )
                return { message: app_constants.group_created };
            }
        } else {
            return { message: app_constants.group_already_created };
        }
    } catch (error) {
        console.log(error)
        return error;
    }
}


exports.deleteGroup = async (obj) => {
    try {
        let user = await user_mongo.findOne({ handle: obj.handle });
        if(!user) return {message : app_constants.no_user_found }

        let group_data = await groups_mongo.findOne({ "group_name": obj.group_name });
        if (group_data != null) {
            if (group_data.admin != obj.handle) {
                return { message: app_constants.invalid_permission }
            } else {
                let deleted_group = await groups_mongo.deleteOne({ "group_name": obj.group_name });
                if (deleted_group) { //If group is deleted then remove it from the groups array of Users Mongo
                    await user_mongo.updateMany(
                        { handle: { $in: group_data.users } },
                        { $pull: { groups: obj.group_name } }

                    )
                    var messages = await message_mongo.deleteMessagesByGroupName(obj.group_name);

                }
                return {
                    message: app_constants.group_deleted, data: {
                        deletedGroupsCount: deleted_group.deletedCount,
                        deletedMessagesCount: messages.deletedCount,
                    }
                };
            }
        } else {
            return { message: app_constants.group_not_found};
        }
    } catch (error) {
        console.log(error)
        return error;
    }
}


exports.addMembers = async (obj) => {
    try {
        let userAdmin = await user_mongo.findOne({ "handle": obj.handle });
        if(!userAdmin) return {message : obj.handle + " " +app_constants.no_user_found }
        let group_data = await groups_mongo.findOne({ "group_name": obj.group_name });
        let users_data = await user_mongo.find({ handle: { $in: obj.users }, $and: [{handle :{$nin: [...group_data.users,'admin']} }]});
        let existing_users = users_data.map(user => user.handle);
        if(existing_users.length == 0) return {message : app_constants.no_user_found + " to add" }
        if (group_data != null) {
            if (group_data.admin != obj.handle) {
                return { message: app_constants.invalid_permission }
            } else {
                await groups_mongo.findOneAndUpdate({ group_name: obj.group_name }, {
                    $push: {
                        users: existing_users
                    }
                }, { 'useFindAndModify': false });

                await user_mongo.updateMany(
                    { handle: { $in: obj.users } },
                    {
                        $push: {
                            groups: obj.group_name
                        }
                    }
                )
            }
            return { message: app_constants.member_added };
        } else {
            return { message: app_constants.group_not_found };
        }
    } catch (error) {
        console.log(error)
        return error;
    }
}

exports.removeMembers = async (obj) => {
    try {
        let userAdmin = await user_mongo.findOne({ "handle": obj.handle });
        if(!userAdmin) return {message : obj.handle + " " +app_constants.no_user_found }

        let group_data = await groups_mongo.findOne({ "group_name": obj.group_name });
        let users_data = await user_mongo.find({ handle: { $in: obj.users } });
        let existing_users = users_data.map(user => user.handle);
        if(existing_users.length == 0) return { message: app_constants.no_user_found + " to remove"}
        if (group_data != null) {
            if (group_data.admin != obj.handle) {
                return { message: app_constants.invalid_permission }
            } else {
                if (existing_users.includes(group_data.admin)) return { message: app_constants.invalid_permission + "!! You can not remove yourself" };
                await groups_mongo.updateOne({ group_name: obj.group_name }, {
                    $pull: {
                        users: { $in: existing_users }
                    }
                }, { 'useFindAndModify': false });

                await user_mongo.updateMany(
                    { handle: { $in: existing_users } },
                    {
                        $pull: {
                            groups: obj.group_name
                        }
                    }
                )
            }
            return { message: app_constants.member_removed };
        } else {
            return { message: app_constants.group_not_found };
        }
    } catch (error) {
        console.log(error)
        return error;
    }
}



/**
 * @param {String} user_handle - handle of user
 * @return {Array} array of all groups that the user belongs to
 */
exports.getGroupsByUserHandle = async (user_handle) => {
    try {
        const groups = await groups_mongo.find({ users: { $all: [user_handle] } });
        return groups;
    } catch (error) {
        throw error;
    }
}

/**
 * @param {String} group_name - name of group
 */
exports.getGroupByGroupName = async function (group_name) {
    try {
        const room = await groups_mongo.findOne({ group_name: group_name });
        return room;
    } catch (error) {
        throw error;
    }
}