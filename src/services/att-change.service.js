import api from "./api";

class GetAttChange {
  get_att_change(payload) {
    return api.get("getAttChange", { params: payload });
  }
}

class GetModalAttChange {
  get_modal_att_change(payload) {
    return api.get("getModalAtt", { params: payload });
  }
}
class GetLeaveHoliday {
  GetLeaveHoliday(payload) {
    return api.get("getLeaveHoliday", { params: payload });
  }
}
class PostAttChange {
  post_att_change(payload) {
    return api.post("postAttChange", payload);
  }
}

class DeleteAttChange {
  delete_att_change(payload) {
    return api.delete("deleteAttChange", { params: payload });
  }
}

export const getAttChange = new GetAttChange();
export const postAttChange = new PostAttChange();
export const getModalAttChange = new GetModalAttChange();
export const getLeaveHoliday = new GetLeaveHoliday();
export const deleteAttChange = new DeleteAttChange();