import api from './api';

class ProfileService {
  async get_profile() {
    return await api.get("profile");
  }
}

const profile = new ProfileService();
export default profile;