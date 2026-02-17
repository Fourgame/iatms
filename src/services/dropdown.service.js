import api from "./api";

class GetDropdown {
    get_dropdown(payload) {
        return api.get("getDropdown", { params: payload });
    }
}

export const getDropdown = new GetDropdown();