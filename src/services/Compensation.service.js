import api from "./api";



class GetCompensation{
    get_compensation(payload) {
        return api.get("getCompensation", { params: payload });
    }
}


export const getCompensation = new GetCompensation();


