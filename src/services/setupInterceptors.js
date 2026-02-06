import axiosInstance from "./api";
import TokenService from "./token.service";

const setup = () => {
    axiosInstance.interceptors.request.use(
        (config) => {
            const token = TokenService.getLocalAccessToken();
            if (token) {
                config.headers["Authorization"] = "Bearer " + token;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
    axiosInstance.interceptors.response.use(
        (res) => {
            return res;
        },
        async (err) => {
            // const originalConfig = err.config;
            // if (
            //     originalConfig.url !== "authen/login" &&
            //     originalConfig.url !== "authen/refresh_token" &&
            //     TokenService.isSignIn()
            // ) {
            //     // Access Token was expired
            //     //if (err.response.status === 401 && !originalConfig._retry) {
            //     if (
            //         ((err.response && err.response.status === 401) ||
            //             err.code === "ERR_NETWORK") &&
            //         !originalConfig._retry
            //     ) {
            //         originalConfig._retry = true;
            //         try {
            //             const rs = await axiosInstance.post("authen/refresh_token", {
            //                 refresh_token: TokenService.getLocalRefreshToken(),
            //             });
            //             const token = rs.data;
            //             TokenService.updateLocalAccessToken(token);

            //             return axiosInstance(originalConfig);
            //         } catch (_error) {
            //             return Promise.reject(_error);
            //         }
            //     }
            // } else if (!TokenService.isSignIn()) {
            //     return Promise.reject(_error);
            // }
            // if (err.response.status === 403) {
            //     return Promise.reject(_error);
            // } else if (err.response.status === 500) {
            //     return Promise.reject(_error);
            // }
            return Promise.reject(err);
        }
    );
};
export default setup;
