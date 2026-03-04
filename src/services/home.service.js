import api from "./api";

class HomeService {
    getHomeDashboard() {
        return api.get("getHomeDashboard");
    }
}

const homeService = new HomeService();
export default homeService;
