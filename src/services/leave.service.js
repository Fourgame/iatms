import api from "./api";

class GetLeave {
    get_leave(payload) {
        return api.get("getLeave", { params: payload });
    }
}

export const getLeave = new GetLeave();
