import secureLocalStorage from "react-secure-storage";

class TokenService {
    getLocalRefreshToken() {
        const user =
            process.env.REACT_APP_ENCRYPT_PROFILE == "true"
                ? JSON.parse(secureLocalStorage.getItem("iatms_profile"))
                : JSON.parse(localStorage.getItem("iatms_profile"));

        return user?.refresh_token;
    }

    getLocalAccessToken() {
        const user =
            process.env.REACT_APP_ENCRYPT_PROFILE == "true"
                ? JSON.parse(secureLocalStorage.getItem("iatms_profile"))
                : JSON.parse(localStorage.getItem("iatms_profile"));

        return user?.token;
    }

    updateLocalAccessToken(token) {
        let user =
            process.env.REACT_APP_ENCRYPT_PROFILE == "true"
                ? JSON.parse(secureLocalStorage.getItem("iatms_profile"))
                : JSON.parse(localStorage.getItem("iatms_profile"));

        user.token = token.token;
        user.refresh_token = token.refresh_token;

        if (process.env.REACT_APP_ENCRYPT_PROFILE == "true")
            secureLocalStorage.setItem("iatms_profile", JSON.stringify(user));
        else localStorage.setItem("iatms_profile", JSON.stringify(user));
    }

    isSignIn() {
        if (process.env.REACT_APP_ENCRYPT_PROFILE == "true")
            return secureLocalStorage.getItem("iatms_profile") ? true : false;

        return localStorage.getItem("iatms_profile") ? true : false;
    }

    setUser(user) {
        if (process.env.REACT_APP_ENCRYPT_PROFILE == "true")
            secureLocalStorage.setItem("iatms_profile", JSON.stringify(user));
        else localStorage.setItem("iatms_profile", JSON.stringify(user));
    }

    deleteUser() {
        if (process.env.REACT_APP_ENCRYPT_PROFILE == "true")
            secureLocalStorage.removeItem("iatms_profile");
        else localStorage.removeItem("iatms_profile");
    }

    getUser() {
        if (process.env.REACT_APP_ENCRYPT_PROFILE == "true")
            return JSON.parse(secureLocalStorage.getItem("iatms_profile"));
        else return JSON.parse(localStorage.getItem("iatms_profile"));
    }
}

const token = new TokenService();
export default token;
