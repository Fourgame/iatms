import React from "react";
import { Link } from "react-router-dom";
import { Navigate, useNavigate } from "react-router-dom";
import TokenService from "../../services/token.service";
const Header = () => {

    const navigate = useNavigate();
    // TODO: พอมี auth จริงค่อยเปลี่ยนให้ดึงจาก Redux
    const currentUser = null; // หรือใส่ mock เช่น { profile: { f_name_eng:"A", l_name_eng:"B" }, role:{ name:"Admin" } }

    const logOut = () => {
        TokenService.deleteUser();
        console.log("after delete:", TokenService.isSignIn());
        console.log("local:", localStorage.getItem("iatms_profile"));
        // console.log("logout");
        navigate("/signin");
    };

    const fullName = currentUser?.profile
        ? `${currentUser.profile.f_name_eng ?? ""} ${currentUser.profile.l_name_eng ?? ""}`.trim()
        : "Full Name";

    const roleName = currentUser?.role?.name ?? "";

    // ตอนนี้ยังไม่มี permission -> ให้โชว์เมนูทั้งหมดไปก่อน
    const showAttendance = true;
    const showReport = true;

    return (
        <nav
            className="navbar navbar-expand-xl navbar-dark px-4 py-2"
            style={{ backgroundColor: "#1C3C85" }}
        >
            <div className="container-fluid d-flex justify-content-between align-items-center">
                {/* Left Side */}
                <div className="d-flex align-items-center gap-5">
                    {/* Brand */}
                    <Link
                        to="/home"
                        className="btn btn-primary border border-3 rounded-4 d-flex align-items-center gap-2 px-3 py-1 border-white text-decoration-none"
                        style={{ backgroundColor: "#04318D", height: "48px" }}
                    >
                        <span className="fw-bold me-2">IATMS</span>
                        <i className="bi bi-calendar-check-fill"></i>
                    </Link>

                    {/* Toggler */}
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Menus */}
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav">
                            {showAttendance && (
                                <li className="nav-item dropdown me-3">
                                    <button
                                        className="nav-link dropdown-toggle text-white fw-bold bg-transparent border-0"
                                        type="button"
                                        data-bs-toggle="dropdown"
                                    >
                                        Attendance
                                    </button>
                                    <ul className="dropdown-menu">
                                        <li>
                                            <Link className="dropdown-item" to="/attendance/check-in">
                                                Check-in
                                            </Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to="/attendance/history">
                                                History
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                            )}

                            {showReport && (
                                <li className="nav-item dropdown">
                                    <button
                                        className="nav-link dropdown-toggle text-white fw-bold bg-transparent border-0"
                                        type="button"
                                        data-bs-toggle="dropdown"
                                    >
                                        Report
                                    </button>
                                    <ul className="dropdown-menu">
                                        <li>
                                            <Link className="dropdown-item" to="/report/monthly">
                                                Monthly Report
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Right Side */}
                <div className="d-flex align-items-center gap-4 ms-auto">
                    <span className="fw-lighter text-white">Version: (Web) | (API)</span>
                    <span className="fw-bold text-white">Role : {roleName}</span>

                    <button
                        className="btn btn-primary rounded-pill border border-2 d-flex align-items-center gap-2 px-3 py-1 border border-black"
                        style={{ backgroundColor: "#2e59d9" }}
                        type="button"
                        onClick={logOut}
                    >
                        <i className="bi bi-person-fill fs-5"></i>
                        <span className="fw-bold">{fullName}</span>
                        <i className="bi bi-box-arrow-right fs-5"></i>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Header;
