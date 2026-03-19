import axiosInstance from "./api";
import TokenService from "./token.service";
import authService from "./auth.service";

let refreshTokenPromise = null;

const setupInterceptors = () => {
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
            const originalConfig = err.config;
            if (
                originalConfig.url !== "/auth/signin" &&
                originalConfig.url !== "/auth/refresh_token" &&
                TokenService.isSignIn()
            ) {
                // Access Token was expired
                //if (err.response.status === 401 && !originalConfig._retry) {
                if (
                    ((err.response && err.response.status === 401) ||
                        err.code === "ERR_NETWORK") &&
                    !originalConfig._retry
                ) {
                    originalConfig._retry = true;
                    try {
                        // เช็คว่ามีการเรียก refresh_token ไปแล้วหรือยัง ถ้ายังให้สร้าง Promise
                        if (!refreshTokenPromise) {
                            refreshTokenPromise = axiosInstance.post("/auth/refresh_token", {
                                refresh_token: TokenService.getLocalRefreshToken(),
                            }).then(rs => {
                                const token = rs.data;
                                TokenService.updateLocalAccessToken(token);
                                return token.token; // ส่ง access_token ใหม่กลับไปให้คนที่รอ
                            }).catch(error => {
                                return Promise.reject(error);
                            }).finally(() => {
                                refreshTokenPromise = null; // คืนค่าเป็น null เมื่อจบงาน
                            });
                        }

                        // รอ Promise ตัวเดียวกัน ไม่ว่าจะเข้ามากี่ Request ก็จะรอ token อันเดียว
                        const newAccessToken = await refreshTokenPromise;
                        originalConfig.headers["Authorization"] = "Bearer " + newAccessToken;

                        return axiosInstance(originalConfig);
                    } catch (_error) {
                        return Promise.reject(_error);
                    }
                }
            }
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
export default setupInterceptors;