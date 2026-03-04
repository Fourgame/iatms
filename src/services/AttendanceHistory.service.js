import api from "./api";



class GetAttHistory{
    get_attHistory(payload) {
        return api.get("getAttHistory", { params: payload });
    }
}


export const getAttHistory = new GetAttHistory();


