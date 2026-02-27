import api from "./api";

class GetLeaveApproval {
    get_leave_approval(payload) {
        return api.get("getLeaveApproval", { params: payload });
    }
}
class PostLeaveApproval {
    post_leave_approval(payload) {
        return api.post("postLeaveApproval", payload);
    }
}

export const getLeaveApproval = new GetLeaveApproval();
export const postLeaveApproval = new PostLeaveApproval();
