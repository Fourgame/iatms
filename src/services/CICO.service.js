import api from "./api";

class GetButton {
    get_button() {
        return api.get("getButton");
    }
}

class GetCICO {
    get_cico(payload) {
        return api.get("getCICO", { params: payload });
    }
}
class PostCICO {
    post_cico(payload) {
        return api.post("postCICO", payload);
    }
}
export const getButton = new GetButton();
export const getCICO = new GetCICO();
export const postCICO = new PostCICO();

