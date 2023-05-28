# GroupChat
Backend APIs for a group chat application. You can create users and groups. Add, Remove Memebers to group. 
Delete the group. Post a message into group, Get recent conversation of user, group. Mark convos read.

# Instructions to run
Clone the project
```
git clone https://github.com/mrrishh/GroupChat.git
```

### DataBase - Mongo
* Check if mongodb service is running in your machine else start the service.

### Server
* You need to have node and npm installed in your machine. Use node v18
* open up your teminal or command prompt go to the directory `GroupChat`
* Do install all dependencies using  
   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`npm install`  
   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`npm install -g nodemon`  
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`npm start`  
Your server will be setup and ready for use.

### Function
When you start a server, it will automatically creates the Admin user in your mongoDB
Admin creds are defined in constants file. 

### Admin Functionality
* Admin can login and will generate the login token to do below: 
* Admin can create normal users
* Admin can edit normal users
* Logout

### Login Logut
* When you perfrom login op, A token will be generated.
* This token is needed to call other APIs

* When you do logout. This token will be destroy for that user

### Create new user
* This API will create a new user. Checks for existance.


### Create new Group
* Creates a new group. Initially you can add other members or not

### Add New Member in Group

### Remove a memeber from group

### Post a message in Group

### Read recent conversation of a group
* Provided group name. it will list out all the conversation of the group based on Pagination

### Read recent conversation of a user
* Fetch all the messages of all the groups posted by User based on pagination

### Mark Conversation Read
* It will mark all the conversation read of a group for the user

### Delete a message by ID
