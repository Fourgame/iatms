import api from "./api";



class GetCompensation{
    get_compensation(payload) {
        return api.get("getCompensation", { params: payload });
    }
}

class GetMonthYearCompensation{
    get_month_year_compensation(payload) {
        return api.get("getMonthYearCompensation", { params: payload });
    }
}


export const getCompensation = new GetCompensation();
export const getMonthYearCompensation = new GetMonthYearCompensation();


