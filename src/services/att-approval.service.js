import api from "./api";

class GetAttApproval {
  get_att_approval(payload) {
    return api.get("getAttApproval", { params: payload });
  }
}

class GetModalAttApproval {
  get_modal_att_approval(payload) {
    return api.get("getModalAttApproval", { params: payload });
  }
}
class PostAttApproval {
  post_att_approval(payload) {
    return api.post("postAttApproval", payload);
  }
}

export const getAttApproval = new GetAttApproval(); 
export const getModalAttApproval = new GetModalAttApproval();
export const postAttApproval = new PostAttApproval();
