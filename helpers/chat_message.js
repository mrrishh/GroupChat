const message_model = require('../model/chat_message'),
  userGroups = require('./user_groups'),
  usersFile = require('./users');


exports.postMessage = async (obj) => {
  try {
    let check_group_exists = await userGroups.getGroupByGroupName(obj.group_name);
    if (!check_group_exists) return { message: `No group exists with this group name : ${obj.group_name}` }
    if (!check_group_exists.users.includes(obj.currentLoggedUser)) return { message: `${obj.currentLoggedUser} is not a member of this group name : ${obj.group_name}` }
    let post = await message_model.createPostInGroup(obj.group_name, obj.messagePayload, obj.currentLoggedUser);
    return post;
  } catch (error) {
    console.log(error);
    return error;
  }
}

exports.getRecentConversation = async (obj) => {
  try {
    const currentLoggedUser = obj.user_handle;
    const options = {
      page: parseInt(obj.page) || 0,
      limit: parseInt(obj.limit) || 10,
    };
    const user = await usersFile.getUserByHandle(obj.user_handle);
    if(!user) return { message : app_constants.no_user_found};
    const groups = await userGroups.getGroupsByUserHandle(currentLoggedUser);
    const group_names = groups.map(group => group.group_name);
    const recentConversation = await message_model.getRecentConversation(
      group_names, options, currentLoggedUser
    );
    return {data: recentConversation};
  } catch (error) {
    console.log(error);
    return error;
  }
}

exports.getConversationByGroupHandle = async (obj) => {
  try {
    const group_name = obj.group_name;
    const group = await userGroups.getGroupByGroupName(group_name)
    if (!group) {
      return {
        message: 'No group exists for this group name',
      }
    }
    const users = await usersFile.getUserByHandles(group.users);
    const options = {
      page: parseInt(obj.page) || 0,
      limit: parseInt(obj.limit) || 10,
    };
    const conversation = await message_model.getConversationByGroupHandle(group_name, options);
    return {
      data : {
        'conversation': conversation,
        'users': users
      }
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

exports.markConversationReadByGroupName = async (obj) => {
  try {
    const group_name = obj.group_name;
    const group = await userGroups.getGroupByGroupName(group_name)
    if (!group) {
      return {
        message: 'No group exists for this group name',
      }
    }
    if (!group.users.includes(obj.user_handle)) return { message: 'Not a group member' }
    const currentLoggedUser = obj.user_handle;
    const result = await message_model.markMessageRead(group_name, currentLoggedUser);
    return { data: result };
  } catch (error) {
    console.log(error);
    return error;
  }
}

/**
 * @param messageId
 * @returns => {@http response }
 * @description Delete a message with message ID
 * @author - Rishabh Nandwal
 */
exports.deleteMessageById = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const postedByUser = req.headers.handle;
    const data = await message_model.deleteMessageById(messageId,postedByUser);
    return res.status(200).send({
      success: true,
      message: "Message Deleted Successfully",
      deletedMessagesCount: data.deletedCount,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, error: error })
  }
}

