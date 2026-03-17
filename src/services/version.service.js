import api from "./api";

class VersionService {
    getApiVersion() {
        return api.get("getVersion");
    }
}

const versionService = new VersionService();
export default versionService;
