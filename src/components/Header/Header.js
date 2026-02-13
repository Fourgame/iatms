import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import TokenService from "../../services/token.service";
import { noticeShowMessage } from "../Utilities/Notification";
import { Button } from 'react-bootstrap';
const Header = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const currentUser = TokenService.getUser();
    const handleRefresh = (e, path) => {
        if (location.pathname.toLowerCase() === path.toLowerCase()) {
            e.preventDefault();
            window.location.reload();
        }
    };
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
        noticeShowMessage("Logged out successfully");
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

    const roleName = currentUser?.profile?.role_id ?? "";
    const fullName = currentUser?.profile?.name_en ?? "Full Name";

    if (!currentUser) return null;



    return (
        <nav
            className="navbar navbar-expand-xl navbar-dark px-4 py-3"
            style={{ backgroundColor: "#1C3C85" }}
        >
            <div className="container-fluid d-flex justify-content-between align-items-center">
                {/* Left Side */}
                <div className="d-flex align-items-center gap-5">
                    {/* Brand */}
                        <Button variant="primary"
                            onClick={(e) => handleRefresh(e, "/home")}
                            className="border border-3 rounded-4 d-flex align-items-center gap-2 px-3 py-1 border-white"
                            style={{
                                "--bs-btn-bg": "#04318D",
                                "--bs-btn-hover-bg": "#2e59d9",
                                "--bs-btn-active-bg": "#2e59d9",
                                height: "48px"
                            }}
                        >
                            <span className="fw-bold me-2">IATMS</span>
                            <i className="bi bi-calendar-check-fill"></i>
                        </Button>
                    
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
                                    <a className="nav-link dropdown-toggle text-white fw-medium" href="#" role="button" data-bs-toggle="dropdown">
                                        Attendance
                                    </a>
                                    <ul className="dropdown-menu shadow border-0 mt-2">
                                        {activeMenus.func.cico && <li><Link className="dropdown-item" to="/attendance/checkinout" onClick={(e) => handleRefresh(e, "/attendance/checkinout")}>Check-in/out & Leave Request</Link></li>}
                                        {activeMenus.func.cico && <li><Link className="dropdown-item" to="/attendance/approve" onClick={(e) => handleRefresh(e, "/attendance/approve")}>Change Request</Link></li>}
                                        {activeMenus.func.approve && <li><Link className="dropdown-item" to="/attendance/approve" onClick={(e) => handleRefresh(e, "/attendance/approve")}>Approve Request</Link></li>}
                                    </ul>
                                </li>
                            )}

                            {/* 2. Menu: Report */}
                            {activeMenus.report && (
                                <li className="nav-item dropdown">
                                    <a className="nav-link dropdown-toggle text-white fw-medium" href="#" role="button" data-bs-toggle="dropdown">
                                        Report
                                    </a>
                                    <ul className="dropdown-menu shadow border-0 mt-2">
                                        {activeMenus.func.rp_attendance && <li><Link className="dropdown-item" to="/report/attendance" onClick={(e) => handleRefresh(e, "/report/attendance")}>Attendance Report</Link></li>}
                                        {activeMenus.func.rp_work_hours && <li><Link className="dropdown-item" to="/report/workhours" onClick={(e) => handleRefresh(e, "/report/workhours")}>Work Hours Report</Link></li>}
                                        {activeMenus.func.rp_compensation && <li><Link className="dropdown-item" to="/report/compensation" onClick={(e) => handleRefresh(e, "/report/compensation")}>Compensation Report</Link></li>}
                                    </ul>
                                </li>
                            )}

                            {/* 3. Menu: Admin */}
                            {activeMenus.admin && (
                                <li className="nav-item dropdown">
                                    <a className="nav-link dropdown-toggle text-white fw-medium" href="#" role="button" data-bs-toggle="dropdown">
                                        Admin
                                    </a>
                                    <ul className="dropdown-menu shadow border-0 mt-2">
                                        <li><Link className="dropdown-item" to="/admin/user-management" onClick={(e) => handleRefresh(e, "/admin/user-management")}>User Management</Link></li>
                                    </ul>
                                </li>
                            )}

                            {/* 4. Menu: Setup */}
                            {activeMenus.setup && (
                                <li className="nav-item dropdown">
                                    <a className="nav-link dropdown-toggle text-white fw-medium" href="#" role="button" data-bs-toggle="dropdown">
                                        Setup
                                    </a>
                                    <ul className="dropdown-menu shadow border-0 mt-2">
                                        {<li><Link className="dropdown-item" to="/setup/Manage-List-of-Values" onClick={(e) => handleRefresh(e, "/setup/Manage-List-of-Values")}>List of Value</Link></li>}
                                        {<li><Link className="dropdown-item" to="/setup/role" onClick={(e) => handleRefresh(e, "/setup/role")}>Define Role</Link></li>}
                                        {<li><Link className="dropdown-item" to="/setup/manage-holidays" onClick={(e) => handleRefresh(e, "/setup/manage-holidays")}>Manage Holiday</Link></li>}
                                    </ul>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Right Side */}
                <div className="d-flex align-items-center gap-4 ms-auto">
                    <span className="fw-lighter text-white">Version: (Web) | (API)</span>
                    <span className="fw-bold text-white">Role : {currentUser.profile.role_id}</span>

                    <Button variant="primary"
                        onClick={logOut}
                        className="rounded-pill border border-2 d-flex align-items-center gap-2 px-3 py-1 border border-black"
                        style={{
                            "--bs-btn-bg": "#2750B0",
                            "--bs-btn-hover-bg": "#2e59d9",
                            "--bs-btn-active-bg": "#2e59d9",
                        }}
                    >
                        <i className="bi bi-person-fill fs-5"></i>
                        <span className="fw-bold">{fullName}</span>
                        <i className="bi bi-box-arrow-right fs-5"></i>
                    </Button>

                    {/* className="rounded-pill border border-2 d-flex align-items-center gap-2 px-3 py-1 border border-black" style={{ backgroundColor: "#2e59d9" }} */}

                    {/* <a
                        className="btn btn-primary rounded-pill border border-2 d-flex align-items-center gap-2 px-3 py-1 border border-black"
                        style={{ backgroundColor: "#2e59d9" }}
                        type="button"
                        onClick={logOut}
                    >
                        <i className="bi bi-person-fill fs-5"></i>
                        <span className="fw-bold">{fullName}</span>
                        <i className="bi bi-box-arrow-right fs-5"></i>
                    </a> */}
                </div>
            </div>
        </nav>
    );
};

export default Header;

