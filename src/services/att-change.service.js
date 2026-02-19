import api from "./api";

class GetAttChange {
  get_att_change(payload) {
    return api.get("getAttChange", { params: payload });
  }
}

class PostAttChange {
  post_att_change(payload) {
    return api.post("postAttChange", payload);
  }
}

export const getAttChange = new GetAttChange();
export const postAttChange = new PostAttChange();