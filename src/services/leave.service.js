import api from "./api";

class GetLeave {
    get_leave(payload) {
        return api.get("getLeave", { params: payload });
    }
}
class PostLeave {
    post_leave(payload) {
        return api.post("postLeave", payload);
    }
}

class DeleteLeave {
    delete_leave(payload) {
        return api.delete("deleteLeave", { params: payload });
    }
}

export const getLeave = new GetLeave();
export const postLeave = new PostLeave();
export const deleteLeave = new DeleteLeave();
