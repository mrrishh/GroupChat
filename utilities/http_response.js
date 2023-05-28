class Response {
    constructor(response_data){
        this.response_data = {
            'status': app_constants.res_failed,
            'status_code' : response_data.status_code,
            'message' : response_data.message || 'ok',
            'data' : response_data.data ? response_data.data : {}
        }
    }
    ok(res) {
        this.response_data['status'] = app_constants.http_status_codes.res_code_success;
        res.status(200).json(this.response_data);
    };
    bad_request(res) {
        res.status(400).json(this.response_data);
    }
    unauthorized(res) {
        res.status(401).json(this.response_data);
    }
    forbidden(res) {
        res.status(403).json(this.response_data);
    }     
    internal_server_error(res) {
        res.status(500).json(this.response_data);
    }
    bad_gateway_api(res) {
        res.status(502).json(this.response_data);
    }
}

module.exports = Object.freeze(Response);