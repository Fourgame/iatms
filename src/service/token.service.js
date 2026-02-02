import secureLocalStorage from "react-secure-storage";

class TokenService {
  getLocalRefreshToken() {
    const user =
      process.env.REACT_APP_ENCRYPT_PROFILE == "true"
        ? JSON.parse(secureLocalStorage.getItem("app_name_profile"))
        : JSON.parse(localStorage.getItem("app_name_profile"));

    return user?.refresh_token;
  }

  getLocalAccessToken() {
    const user =
      process.env.REACT_APP_ENCRYPT_PROFILE == "true"
        ? JSON.parse(secureLocalStorage.getItem("app_name_profile"))
        : JSON.parse(localStorage.getItem("app_name_profile"));

    return user?.token;
  }

  updateLocalAccessToken(token) {
    let user =
      process.env.REACT_APP_ENCRYPT_PROFILE == "true"
        ? JSON.parse(secureLocalStorage.getItem("app_name_profile"))
        : JSON.parse(localStorage.getItem("app_name_profile"));

    user.token = token.token;
    user.refresh_token = token.refresh_token;

    if (process.env.REACT_APP_ENCRYPT_PROFILE == "true")
      secureLocalStorage.setItem("app_name_profile", JSON.stringify(user));
    else localStorage.setItem("app_name_profile", JSON.stringify(user));
  }

  isSignIn() {
    if (process.env.REACT_APP_ENCRYPT_PROFILE == "true")
      return secureLocalStorage.getItem("app_name_profile") ? true : false;

    return localStorage.getItem("app_name_profile") ? true : false;
  }

  setUser(user) {
    if (process.env.REACT_APP_ENCRYPT_PROFILE == "true")
      secureLocalStorage.setItem("app_name_profile", JSON.stringify(user));
    else localStorage.setItem("app_name_profile", JSON.stringify(user));
  }

  deleteUser() {
    if (process.env.REACT_APP_ENCRYPT_PROFILE == "true")
      secureLocalStorage.removeItem("app_name_profile");
    else localStorage.removeItem("app_name_profile");
  }
}

const token = new TokenService();
export default token;
