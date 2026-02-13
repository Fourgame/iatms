import api from "./api";

class GetHolidays {
  get_holidays(payload) {
    return api.get("getHolidays", { params: payload });
  }
}

class PostHolidays {
  post_holidays(payload) {
    return api.post("postHolidays", payload);
  }
}




class GetHolidayYears {
  get_holiday_years() {
    return api.get("getHolidayYears");
  }
}

export const getHolidays = new GetHolidays();
export const postHolidays = new PostHolidays();

export const getHolidayYears = new GetHolidayYears();
