import api from "./api";

class GetUserManage {
    get_user_manage(payload) {
        return api.get("getUserManage", { params: payload });
    }
}

class PostUserManage {
    post_user_manage(payload) {
        return api.post("postUserManage", payload);
    }
}

class GetDropdown {
    get_dropdown(payload) {
        return api.get("getDropdown", { params: payload });
    }
}

class FindLdap {
    find_ldap(payload) {
        return api.get("find", { params: payload });
    }
}

export const getDropdown = new GetDropdown();
export const getUserManage = new GetUserManage();
export const postUserManage = new PostUserManage();
export const findLdap = new FindLdap();