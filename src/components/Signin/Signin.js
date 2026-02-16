import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthService from "../../services/auth.service";
import TokenService from "../../services/token.service";
import { useLocation } from "react-router-dom";
import { noticeShowMessage } from "../Utilities/Notification";




const Signin = (props) => {

  const navigate = useNavigate();
  const [username, setUsername] = useState("napattarapong.c");
  const [password, setPassword] = useState("1234");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const skipLogin = false;

  // เก็บข้อความ error ใน state เอง
  const [message, setMessage] = useState();
  const location = useLocation();
  // เก็บสถานะ login เอง
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const message = location.state?.message;
    if (message) {
      setMessage(message);
      noticeShowMessage(`${message} from message`, true);
    }
  }, []);


  const handleLogin = async (e) => {
    if (skipLogin) {
      navigate("/home", { replace: true });
      return;
    }
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {


      // เรียก API จริง (AuthService จะ setUser ลง TokenService ให้อยู่แล้ว)
      var response = await AuthService.login(username, password);
      try {
        if (response.status === 200) {
          TokenService.setUser(response.data);
          navigate("/home");
          setIsLoggedIn(true);
        } else {
          debugger;
          setMessage("Login failed. 1");
          setLoading(false);
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message || err.message || "Login failed. 2";
        setMessage(msg);
        setLoading(false);
      }

      window.location.reload();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Login failed. 3";
      setMessage(msg);
      setLoading(false);
    }
  };

  // if (isLoggedIn) {
  //   return <Navigate to="/home" />;
  // }



  return (
    <div
      className="vh-100 overflow-hidden d-flex justify-content-end align-items-center "  //boder-danger
      style={{
        backgroundImage: "url(/signin_bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="justify-content-end me-5">
        <h3 className="text-light fs-1 ">
          <p className="lh-1">Intern Attendance Tracking</p>
          <span className="lh-1">Management System</span>
          <i className="ms-3 bi bi-calendar"></i>
        </h3>
        <div className="align-items-center">
          <div className="card rounded-4 mt-4 " style={{ width: "38rem", maxWidth: "90vw" }}>
            <div className="card-body p-4">

              <form onSubmit={handleLogin}>
                {/* OA User */}
                <div className="mb-4 text-start">
                  <label htmlFor="txt_username" className="form-label fw-bold fs-4">
                    OA User
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg bg-light border-0 py-3 px-4 rounded-3"
                    id="txt_username"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="off"
                    placeholder="OA User"
                  />
                </div>

                {/* Password */}
                <div className="mb-3 text-start">
                  <label htmlFor="txt_password" className="form-label fw-bold fs-4">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control form-control-lg bg-light border-0 py-3 px-4 rounded-3"
                    id="txt_password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="off"
                    placeholder="Password"
                  />
                </div>

                {/* Checkbox */}
                <div className="form-check text-start mb-4">
                  <input
                    className="form-check-input border border-1 border-dark"
                    type="checkbox"
                    id="checkDefault"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                  />
                  <label className="form-check-label ms-2" htmlFor="checkDefault">
                    Show Password
                  </label>
                </div>

                {/* Error */}
                {message && (
                  <div className="text-end mb-3">
                    <p className="text-danger m-0">{message}</p>
                  </div>
                )}

                {/* Button */}
                <div className="text-center">
                  {loading ? (
                    <button className="btn btn-primary btn-sm py-3 w-50 rounded-3" type="button" disabled>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      &nbsp;Loading...
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm py-3 w-50 rounded-3"
                    // style={{ backgroundColor: "#0020BF" }}
                    >
                      <i className="bi bi-box-arrow-in-right me-2 fs-4"></i>
                      <span className="fs-4">Login</span>
                    </button>
                  )}
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
