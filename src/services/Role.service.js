import axiosInstance from "./api";
class RoleService {
    async getRole() {
        return await axiosInstance.get("role");
    }
    async postRole(data) {
        return await axiosInstance.post("PostRole", data);
    }
}

const roleService = new RoleService();
export default roleService;
