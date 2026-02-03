import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navigate, useNavigate } from "react-router-dom";
import TokenService from "../../services/token.service";
const Header = () => {

    const navigate = useNavigate();
    const currentUser = TokenService.getUser();

    const [activeMenus, setActiveMenus] = useState({
        attendance: false,
        report: false,
        admin: false,
        setup: false,
        func: {
            approve: false,
            cico: false,
            rp_attendance: false,
            rp_work_hours: false,
            rp_compensation: false
        }
    });


    const logOut = () => {
        TokenService.deleteUser();
        console.log("after delete:", TokenService.isSignIn());
        console.log("local:", localStorage.getItem("iatms_profile"));
        // console.log("logout");
        // console.log("logout");
        // TokenService.deleteUser();
        navigate("/signin");
    };


    useEffect(() => {
        const user = TokenService.getUser();
        if (user) {
            setActiveMenus({
                attendance: user?.role?.menu_attendance,
                report: user?.role?.menu_report,
                admin: user?.role?.menu_admin,
                setup: user?.role?.menu_setup,
                func: {
                    approve: user?.role?.func_approve,
                    cico: user?.role?.func_cico,
                    rp_attendance: user?.role?.func_rp_attendance,
                    rp_work_hours: user?.role?.func_rp_work_hours,
                    rp_compensation: user?.role?.func_rp_compensation
                }
            });
        }

    }, []);

    const roleName = currentUser?.profile?.role_name ?? "";
    const fullName = currentUser?.profile?.name_en ?? "Full Name";

    if (!TokenService.isSignIn()) return null;

    

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
                    <a
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </a>

                    {/* Menus */}
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-4">

                            {/* 1. Menu: Attendance */}
                            {activeMenus.attendance && (
                                <li className="nav-item dropdown">
                                    <a className="nav-link dropdown-toggle text-white fw-light" href="#" role="button" data-bs-toggle="dropdown">
                                        Attendance
                                    </a>
                                    <ul className="dropdown-menu shadow border-0 mt-2">
                                        {activeMenus.func.cico && <li><Link className="dropdown-item" to="/attendance/checkinout">Check In/Out</Link></li>}
                                        {activeMenus.func.approve && <li><Link className="dropdown-item" to="/attendance/approve">Approve Timesheet</Link></li>}
                                        <li><Link className="dropdown-item" to="/attendance/history">History</Link></li>
                                    </ul>
                                </li>
                            )}

                            {/* 2. Menu: Report */}
                            {activeMenus.report && (
                                <li className="nav-item dropdown">
                                    <a className="nav-link dropdown-toggle text-white fw-light" href="#" role="button" data-bs-toggle="dropdown">
                                        Report
                                    </a>
                                    <ul className="dropdown-menu shadow border-0 mt-2">
                                        {activeMenus.func.rp_attendance && <li><Link className="dropdown-item" to="/report/attendance">Attendance Report</Link></li>}
                                        {activeMenus.func.rp_work_hours && <li><Link className="dropdown-item" to="/report/workhours">Work Hours Report</Link></li>}
                                        {activeMenus.func.rp_compensation && <li><Link className="dropdown-item" to="/report/compensation">Compensation Report</Link></li>}
                                    </ul>
                                </li>
                            )}

                            {/* 3. Menu: Admin */}
                            {activeMenus.admin && (
                                <li className="nav-item dropdown">
                                    <a className="nav-link dropdown-toggle text-white fw-light" href="#" role="button" data-bs-toggle="dropdown">
                                        Admin
                                    </a>
                                    <ul className="dropdown-menu shadow border-0 mt-2">
                                        <li><Link className="dropdown-item" to="/admin/user">User Manage</Link></li>
                                    </ul>
                                </li>
                            )}

                            {/* 4. Menu: Setup */}
                            {activeMenus.setup && (
                                <li className="nav-item dropdown">
                                    <a className="nav-link dropdown-toggle text-white fw-light" href="#" role="button" data-bs-toggle="dropdown">
                                        Setup
                                    </a>
                                    <ul className="dropdown-menu shadow border-0 mt-2">
                                        {<li><Link className="dropdown-item" to="/setup/lov">List of Value</Link></li>}
                                        {<li><Link className="dropdown-item" to="/setup/role">Define Role</Link></li>}
                                        {<li><Link className="dropdown-item" to="/setup/holiday">Manage Holiday</Link></li>}
                                    </ul>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Right Side */}
                <div className="d-flex align-items-center gap-4 ms-auto">
                    <span className="fw-lighter text-white">Version: (Web) | (API)</span>
                    <span className="fw-bold text-white">Role : {currentUser.profile.roleNa}</span>

                    <a
                        className="btn btn-primary rounded-pill border border-2 d-flex align-items-center gap-2 px-3 py-1 border border-black"
                        style={{ backgroundColor: "#2e59d9" }}
                        type="button"
                        onClick={logOut}
                    >
                        <i className="bi bi-person-fill fs-5"></i>
                        <span className="fw-bold">{fullName}</span>
                        <i className="bi bi-box-arrow-right fs-5"></i>
                    </a>
                </div>
            </div>
        </nav>
    );
};

export default Header;
