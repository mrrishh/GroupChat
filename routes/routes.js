const controllers = require('../controller/controller'),
    group_controllers = require('../controller/group_controller'),
    chat_message = require('../helpers/chat_message'),
    express = require('express'),
    app = express.Router();


app.route('/v1/login').post(controllers.login);
app.route('/v1/logout').post(controllers.authorize(), controllers.logout);

app.route('/v1/user/get_users').get(controllers.authorize(), controllers.getUser);
app.route('/v1/admin/register/create_new_user').post(controllers.authorize(), controllers.createUser);
app.route('/v1/admin/register/edit_user').post(controllers.authorize(), controllers.editUser);

app.route('/v1/user/create_group').post(controllers.authorize(), group_controllers.createGroup);
app.route('/v1/user/delete_group').delete(controllers.authorize(), group_controllers.deleteGroup);
app.route('/v1/user/groups/add_members').post(controllers.authorize(), group_controllers.addMembersToGroup);
app.route('/v1/user/groups/remove_members').post(controllers.authorize(), group_controllers.removeMembersFromGroup);

app.route('/v1/get_recent_conversation').get(controllers.authorize(), group_controllers.getRecentConversation);
app.route('/v1/get_conversation/:group_name/:page/:limit').get(controllers.authorize(), group_controllers.getConversationByGroupHandle);
app.route('/v1/group/post_message').post(controllers.authorize(), group_controllers.postMessage);
app.route('/v1/group/mark_read').post(controllers.authorize(), group_controllers.markConversationReadByGroupName);
app.route('/v1/delete/message/:messageId').delete(controllers.authorize(), chat_message.deleteMessageById);



module.exports = app;
