const mongoose = require('mongoose'),
  { v4: uuidv4 } = require('uuid');

const MESSAGE_TYPES = {
  TYPE_TEXT: "text",
};

const readByRecipientSchema = new mongoose.Schema(
  {
    _id: false,
    readByUserHandle: String,
    readAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: false,
  }
);

const chatMessageSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace(/\-/g, ""),
    },
    groupName: String,
    message: mongoose.Schema.Types.Mixed,
    type: {
      type: String,
      default: () => MESSAGE_TYPES.TYPE_TEXT,
    },
    postedByUser: String,
    readByRecipients: [readByRecipientSchema],
  },
  {
    timestamps: true,
    collection: "chatmessages",
  }
);


let chatMessage = mongoose.model('ChatMessage', chatMessageSchema);


async function createPostInGroup(groupName, message, postedByUser) {
  try {
    console.log(groupName, message, postedByUser);
    const post = await new chatMessage({
      groupName,
      message,
      postedByUser,
      readByRecipients: { readByUserHandle: postedByUser }
    }).save();
    console.log("post===>", post)
    const aggregate = await chatMessage.aggregate([
      // get post where _id = post._id
      { $match: { _id: post._id } },
      // do a join on another table called users, and 
      // get me a user whose handle = postedByUser
      {
        $lookup: {
          from: 'users',
          localField: 'postedByUser',
          foreignField: 'handle',
          as: 'postedByUser',
          pipeline: [{ "$project": { "token": 0 }}] 
        }
      },
      { $unwind: '$postedByUser' },
      // do a join on another table called groups, and 
      // get me a group whose group_name = groupName
      {
        $lookup: {
          from: 'groups',
          localField: 'groupName',
          foreignField: 'group_name',
          as: 'groupInfo',
        }
      },
      { $unwind: '$groupInfo' },
      { $unwind: '$groupInfo.users' },
      // do a join on another table called users, and 
      // get me a user whose handle = users
      {
        $lookup: {
          from: 'users',
          localField: 'groupInfo.users',
          foreignField: 'handle',
          as: 'groupInfo.userProfile',
          pipeline: [{ "$project": { "token": 0 }}] 
        }
      },
      //{ $unwind: '$groupInfo.userProfile' },
      // group data
      {
        $group: {
          _id: '$groupInfo._id',
          postId: { $last: '$_id' },
          groupName: { $last: '$groupInfo.group_name' },
          message: { $last: '$message' },
          type: { $last: '$type' },
          postedByUser: { $last: '$postedByUser' },
          readByRecipients: { $last: '$readByRecipients' },
          groupInfo: { $addToSet: '$groupInfo.userProfile' },
          createdAt: { $last: '$createdAt' },
          updatedAt: { $last: '$updatedAt' },
        }
      }
    ]);
    return {data: aggregate[0]};
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getConversationByGroupHandle(groupName, options) {
  try {
    return chatMessage.aggregate([
      { $match: { groupName } },
      { $sort: { createdAt: -1 } },
      // do a join on another table called users, and 
      // get me a user whose handle = postedByUser
      {
        $lookup: {
          from: 'users',
          localField: 'postedByUser',
          foreignField: 'handle',
          as: 'postedByUser',
          pipeline: [{ "$project": { "token": 0 }}] 
        }
      },
      { $unwind: "$postedByUser" },
      // apply pagination
      { $skip: options.page * options.limit },
      { $limit: options.limit },
      { $sort: { createdAt: 1 } },
    ]);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function markMessageRead(groupName, currentUserOnlineHandle) {
  try {
    return chatMessage.updateMany(
      {
        groupName,
        'readByRecipients.readByUserHandle': { $ne: currentUserOnlineHandle }
      },
      {
        $addToSet: {
          readByRecipients: { readByUserHandle: currentUserOnlineHandle }
        }
      },
      {
        multi: true
      }
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getRecentConversation(groupNames, options, currentUserOnlineHandle) {
  try {
    return chatMessage.aggregate([
      { $match: { groupName: { $in: groupNames }, postedByUser:currentUserOnlineHandle } },
      {
        $group: {
          _id: '$groupName',
          messageId: { $last: '$_id' },
          groupName: { $last: '$groupName' },
          message: { $last: '$message' },
          type: { $last: '$type' },
          postedByUser: { $last: '$postedByUser' },
          createdAt: { $last: '$createdAt' },
          readByRecipients: { $last: '$readByRecipients' },
        }
      },
      { $sort: { createdAt: -1 } },
      // do a join on another table called users, and 
      // get me a user whose handle = postedByUser
      {
        $lookup: {
          from: 'users',
          localField: 'postedByUser',
          foreignField: 'handle',
          as: 'postedByUser',
          pipeline: [{ "$project": { "token": 0 }}] 
        }
      },
      { $unwind: "$postedByUser" },
      // do a join on another table called groups, and 
      // get me group details
      {
        $lookup: {
          from: 'groups',
          localField: 'groupName',
          foreignField: 'group_name',
          as: 'groupInfo',
        }
      },
      { $unwind: "$groupInfo" },
      { $unwind: "$groupInfo.users" },
      // do a join on another table called users 
      {
        $lookup: {
          from: 'users',
          localField: 'groupInfo.users',
          foreignField: 'handle',
          as: 'groupInfo.userProfile',
          pipeline: [{ "$project": { "token": 0 }}] 
        }
      },
      { $unwind: "$readByRecipients" },
      // do a join on another table called users 
      {
        $lookup: {
          from: 'users',
          localField: 'readByRecipients.readByUserHandle',
          foreignField: 'hanlde',
          as: 'readByRecipients.readByUser',
          pipeline: [{ "$project": { "token": 0 }}] 
        }
      },
      // apply pagination
      { $skip: options.page * options.limit },
      { $limit: options.limit },
    ]);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function deleteMessageById(messageId,postedByUser) {
  try {
    const deleted_message = await chatMessage.deleteOne({ _id: messageId, postedByUser : postedByUser});
    return deleted_message;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function deleteMessagesByGroupName(groupName) {
  try {
    const deleted_messages = await chatMessage.deleteMany({ groupName: groupName});
    return deleted_messages;
  } catch (error) {
    console.log(error);
    throw error;
  }
}



module.exports = { chatMessage, createPostInGroup, getConversationByGroupHandle, markMessageRead, getRecentConversation, deleteMessageById ,deleteMessagesByGroupName};
