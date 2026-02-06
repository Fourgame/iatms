import axiosInstance from "./api";

class ProfileService {
    async getProfile() {
        return await axiosInstance.get("profile");
    }
}

const profileService = new ProfileService();
export default profileService;