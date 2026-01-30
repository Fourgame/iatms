import axios from "axios";

const base_endpoint_url =
    process.env.REACT_APP_ENV == "prod"
        ? process.env.REACT_APP_API_URL_PROD
        : process.env.REACT_APP_ENV == "uat"
            ? process.env.REACT_APP_API_URL_UAT
            : process.env.REACT_APP_API_URL_LOCAL;
const origin =
    process.env.REACT_APP_ENV == "prod"
        ? process.env.REACT_APP_ORIGIN_PROD
        : process.env.REACT_APP_ENV == "uat"
            ? process.env.REACT_APP_ORIGIN_UAT
            : process.env.REACT_APP_ORIGIN_LOCAL;

const client = axios.create({
    baseURL: base_endpoint_url,
    // headers: {
    //   "Origin": origin,
    // },
});

const login = async (username, password) => {
    const user = {
        username: username,
        password: password,
    };

    return await client.post("/auth/SignIn", user);
};
export default { login };