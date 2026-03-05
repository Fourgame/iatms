import api from "./api";

class WorkHoursService {
    getHourHistory(payload) {
        return api.get("getHourHistory", { params: payload });
    }
}

export const workHoursService = new WorkHoursService();
