import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import TokenService from "../../services/token.service";
import { noticeShowMessage } from "../Utilities/Notification";
import VersionService from "../../services/version.service";
import { Button } from 'react-bootstrap';
const Header = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const currentUser = TokenService.getUser();
    const [apiVersion, setApiVersion] = useState("");
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
        document.title = process.env.REACT_APP_TITLE || "IATMS";
        noticeShowMessage("Logged out successfully");
        navigate("/signin");
    };

    const goHome = () => {
        const target = "/home";
        if (location.pathname.toLowerCase() === target) {
            window.location.reload();
        } else {
            navigate(target);
        }
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

    useEffect(() => {
        const fetchApiVersion = async () => {
            try {
                const response = await VersionService.getApiVersion();
                setApiVersion(response.data?.version || response.data || "");
            } catch (err) {
                setApiVersion("-");
            }
        };
        fetchApiVersion();
    }, []);

    const roleName = currentUser?.profile?.role_id ?? "";
    const fullName = currentUser?.profile?.name_en ?? "Full Name";

    // Check if current path starts with a given prefix to determine active nav group
    const isNavActive = (prefix) => location.pathname.toLowerCase().startsWith(prefix.toLowerCase());

    if (!currentUser) return null;



    return (
        <nav
            className="navbar navbar-expand-xl navbar-dark px-4 py-3"
            style={{ backgroundColor: "#1C3C85", position: "relative", zIndex: 1050 }}
        >
            <style>
                {`
                .nav-item.dropdown {
                    transition: all 0.3s ease;
                }
                .nav-item.dropdown:hover {
                    transform: translateY(-2px) scale(1.05);
                }
                .nav-link.dropdown-toggle {
                    transition: color 0.3s ease;
                }
                .nav-item.dropdown:hover .nav-link.dropdown-toggle {
                    color: #ffffffff !important;
                    text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
                }
                .nav-active-underline > .nav-link.dropdown-toggle {
                    border-bottom: 3px solid #ffffff;
                    padding-bottom: 4px;
                }
                `}
            </style>
            <div className="container-fluid d-flex justify-content-between align-items-center">
                {/* Left Side */}
                <div className="d-flex align-items-center gap-5">
                    {/* Brand */}
                    <Button variant="primary"
                        onClick={goHome}
                        className="border border-3 rounded-4 d-none d-xl-flex align-items-center gap-2 px-3 py-1 border-white"
                        style={{
                            "--bs-btn-bg": "#04318D",
                            "--bs-btn-hover-bg": "#2e59d9",
                            "--bs-btn-active-bg": "#2e59d9",
                            height: "48px",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
                        }}
                    >
                        <span className="fw-bold me-2">IATMS</span>
                        <i className="bi bi-calendar-check-fill"></i>
                    </Button>

                    {/* Toggler */}
                    <button
                        className="navbar-toggler border-white"
                        type="button"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#offcanvasNavbar"
                        aria-controls="offcanvasNavbar"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Menus */}
                    <div className="offcanvas offcanvas-start" tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel" style={{ backgroundColor: "#1C3C85" }}>
                        <div className="offcanvas-header border-bottom" style={{ borderColor: "rgba(255,255,255,0.1) !important" }}>
                            <Button variant="primary"
                                onClick={goHome}
                                className="border border-3 rounded-4 d-flex align-items-center gap-2 px-3 py-1 border-white"
                                style={{
                                    "--bs-btn-bg": "#04318D",
                                    "--bs-btn-hover-bg": "#2e59d9",
                                    "--bs-btn-active-bg": "#2e59d9",
                                    height: "48px",
                                    boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
                                }}
                            >
                                <span className="fw-bold me-2">IATMS</span>
                                <i className="bi bi-calendar-check-fill"></i>
                            </Button>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                        </div>
                        <div className="offcanvas-body">
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-4 mt-2 mt-xl-0">

                                {/* 1. Menu: Attendance */}
                                {activeMenus.attendance && (
                                    <li className={`nav-item dropdown${isNavActive('/attendance') ? ' nav-active-underline' : ''}`}>
                                        <a className="nav-link dropdown-toggle text-white fw-medium" href="#" role="button" data-bs-toggle="dropdown">
                                            Attendance
                                        </a>
                                        <ul className="dropdown-menu shadow border-0 mt-2">
                                            {activeMenus.func.cico && <li><Link className="dropdown-item" to="/attendance/Check-In-&-Check-Out" onClick={(e) => handleRefresh(e, "/attendance/Check-In-&-Check-Out")}>Check-In & Check-Out</Link></li>}
                                            {activeMenus.func.cico && <li><Link className="dropdown-item" to="/attendance/Attendance-&-Leave-Management " onClick={(e) => handleRefresh(e, "/attendance/Attendance-&-Leave-Management")}>Attendance & Leave Management</Link></li>}
                                            {activeMenus.func.approve && <li><Link className="dropdown-item" to="/attendance/Attendance-&-Leave-Approval" onClick={(e) => handleRefresh(e, "/attendance/Attendance-&-Leave-Approval")}>Attendance & Leave Approval</Link></li>}
                                        </ul>
                                    </li>
                                )}

                                {/* 2. Menu: Report */}
                                {activeMenus.report && (
                                    <li className={`nav-item dropdown${isNavActive('/report') ? ' nav-active-underline' : ''}`}>
                                        <a className="nav-link dropdown-toggle text-white fw-medium" href="#" role="button" data-bs-toggle="dropdown">
                                            Report
                                        </a>
                                        <ul className="dropdown-menu shadow border-0 mt-2">
                                            {activeMenus.func.rp_attendance && <li><Link className="dropdown-item" to="/report/Attendance-History" onClick={(e) => handleRefresh(e, "/report/Attendance-History")}>Attendance History</Link></li>}
                                            {activeMenus.func.rp_work_hours && <li><Link className="dropdown-item" to="/report/Work-Hours" onClick={(e) => handleRefresh(e, "/report/Work-Hours")}>Work Hours</Link></li>}
                                            {activeMenus.func.rp_compensation && <li><Link className="dropdown-item" to="/report/Compensation" onClick={(e) => handleRefresh(e, "/report/Compensation")}>Compensation</Link></li>}
                                        </ul>
                                    </li>
                                )}

                                {/* 3. Menu: Admin */}
                                {activeMenus.admin && (
                                    <li className={`nav-item dropdown${isNavActive('/admin') ? ' nav-active-underline' : ''}`}>
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
                                    <li className={`nav-item dropdown${isNavActive('/setup') ? ' nav-active-underline' : ''}`}>
                                        <a className="nav-link dropdown-toggle text-white fw-medium" href="#" role="button" data-bs-toggle="dropdown">
                                            Setup
                                        </a>
                                        <ul className="dropdown-menu shadow border-0 mt-2">
                                            {<li><Link className="dropdown-item" to="/setup/manage-list-of-values" onClick={(e) => handleRefresh(e, "/setup/manage-list-of-values")}>Manage List Of Values</Link></li>}
                                            {<li><Link className="dropdown-item" to="/setup/role" onClick={(e) => handleRefresh(e, "/setup/role")}>Role</Link></li>}
                                            {<li><Link className="dropdown-item" to="/setup/manage-holidays" onClick={(e) => handleRefresh(e, "/setup/manage-holidays")}>Manage Holidays</Link></li>}
                                        </ul>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Side */}
                <div className="d-flex align-items-center gap-2 gap-md-4 ms-auto">
                    <span className="fw-lighter text-white d-none d-xl-inline">Version: {process.env.REACT_APP_VERSION} (Web) | {apiVersion} (API)</span>
                    <span className="fw-bold text-white d-none d-md-inline">Role : {currentUser.profile.role_id}</span>

                    <Button variant="primary"
                        onClick={logOut}
                        className="rounded-pill border border-2 d-flex align-items-center gap-2 px-3 py-1 border border-black"
                        style={{
                            "--bs-btn-bg": "#2750B0",
                            "--bs-btn-hover-bg": "#2e59d9",
                            "--bs-btn-active-bg": "#2e59d9",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                            transition: "all 0.3s ease"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.4)"}
                        onMouseOut={(e) => e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.3)"}
                    >
                        <i className="bi bi-person-fill fs-5"></i>
                        <span className="fw-bold d-none d-sm-inline">{fullName}</span>
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