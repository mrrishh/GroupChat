function define(name, value) {
    Object.defineProperty(exports, name, {
        value: value,
        enumerable: true
    });
}

define("admin_role", "admin");
define("default_role", "user");
define("JWT_SECRET", "goK!pusp6ThEdURUtRenOwUhAsWUCLheBazl!uJLPlS8EbreWLdrupIwabRAsiBu")


define("res_invalid_params","Please recheck for the parameters");
define("res_success", "success");
define("res_failed", "failed");
define("res_unauthorized", "unauthorized");

define("invalid_token", "Invalid Token");
define("invalid_user", "Invalid userhandle or password!!");
define("invalid_permission", "Invalid permissions");

define("already_logged_in","You are already logged in!!")
define("no_user_found", "No such user found")
define("user_created","User has been created Successfully!!")
define("user_already_exist","User already registered! Please Login");
define("user_modified", "User details updated!")

define("group_created", "Group has been created Successfully!!");
define("group_already_created","Group is already there!! Please add members");
define("group_deleted","Group Deleted!!");
define("group_not_found", "Group not found");

define("member_added", "Memeber added to group!!")
define("member_removed", "Memeber removed from group!!")






//status: app_constants.http_status_codes.res_code_success
/*-----------http status codes ----------------*/

define("http_status_codes", {
    res_code_success: 200,
    res_code_bad_request: 400,
    res_code_unauthorize: 401,
    res_code_forbidden: 403,
    res_code_internal_server_error: 500,
    res_code_invalid_user_password: 2002,
    res_code_role_mismatch: 2004,
    res_code_invalid_token: 2008,
    res_code_invalid_params: 2009
});