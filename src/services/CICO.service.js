import api from "./api";

class GetButton {
    get_button() {
        return api.get("getButton");
    }
}

class GetCICO {
    get_cico(payload) {
        return api.get("getCICO", payload);
    }
}

export const getButton = new GetButton();
export const getCICO = new GetCICO();