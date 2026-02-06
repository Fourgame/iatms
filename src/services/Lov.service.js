import api from "./api";

class GetLov {
  get_lov(payload) {
    return api.get("getLov", { params: payload });
  }
}

class PostLov {
  post_lov(payload) {
    return api.post("postLov", payload);
  }
}

export const getLov = new GetLov();
export const postLov = new PostLov();