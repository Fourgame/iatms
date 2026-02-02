import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ currentUser, onLogout }) => {
    const navigate = useNavigate();

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

    const handleLogoutClick = (e) => {
        e.preventDefault();
        if (onLogout) {
            onLogout();
            navigate('/signin');
        }
    };

    useEffect(() => {
        if (currentUser && currentUser.role) {
            const r = currentUser.role;
            setActiveMenus({
                attendance: r.menu_attendance,
                report: r.menu_report,
                admin: r.menu_admin,
                setup: r.menu_setup,
                func: {
                    approve: r.func_approve,
                    cico: r.func_cico,
                    rp_attendance: r.func_rp_attendance,
                    rp_work_hours: r.func_rp_work_hours,
                    rp_compensation: r.func_rp_compensation
                }
            });
        }
    }, [currentUser]);


    if (!currentUser) return null;

    const { name_en, role_name } = currentUser.profile || {};






    return (
        <nav className="navbar navbar-expand-lg navbar-dark p-2 shadow-sm" style={{ backgroundColor: '#1a3a6d' }}>
            <div className="container-fluid">

                {/* 1. IATMS Brand Capsule (ซ้าย) */}
                <Link className="navbar-brand d-flex align-items-center border border-white rounded-pill px-3 py-1 me-4" to="/home">
                    <span className="fw-bold me-1 text-white" style={{ fontSize: '0.9rem' }}>IATMS</span>
                    <i className="bi bi-calendar-check-fill small text-white"></i>
                </Link>

                <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    {/* 2. เมนูหลัก (จัดกึ่งกลางซ้าย) */}
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">

                        {/* 1. Menu: Attendance */}
                        {activeMenus.attendance && (
                            <li className="nav-item dropdown px-2">
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
                            <li className="nav-item dropdown px-2">
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
                            <li className="nav-item dropdown px-2">
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
                            <li className="nav-item dropdown px-2">
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

                    {/* 3. ส่วนข้อมูล Version และ Role (ขวา) */}
                    <div className="d-flex align-items-center text-white-50 small pe-4 d-none d-lg-flex" style={{ fontSize: '0.85rem' }}>
                        <span className="me-4">Version: 1.0.0(Web) Version: 1.0.0(API)</span>
                        <span className="me-2">Role : {role_name}</span>
                    </div>

                    {/* 4. User Profile Capsule (ขวาสุด) */}
                    <div className="d-flex align-items-center border border-white rounded-pill px-3 py-1 text-white bg-white bg-opacity-10 shadow-sm">
                        {/* ไอคอนโปรไฟล์ */}
                        <i className="bi bi-person-circle me-2" style={{ fontSize: '1.2rem' }}></i>

                        {/* ชื่อผู้ใช้ */}
                        <span className="me-3 small text-nowrap fw-light">
                            {name_en || "User Name"}
                        </span>

                        {/* เส้นคั่นแนวตั้งสีขาวจางๆ */}
                        <div className="border-start border-white border-opacity-25 mx-1" style={{ height: '18px' }}></div>

                        {/* ปุ่ม Logout: ปรับให้มี Padding เล็กน้อยเพื่อให้พื้นที่คลิกกว้างขึ้น */}
                        <button
                            type="button"
                            onClick={handleLogoutClick}
                            className="btn btn-link text-white p-1 ms-1 d-flex align-items-center border-0 shadow-none"
                            style={{
                                textDecoration: 'none',
                                cursor: 'pointer',
                                minWidth: '30px',
                                minHeight: '30px'
                            }}
                        >
                            <i className="bi bi-box-arrow-right" style={{ fontSize: '1.2rem' }}></i>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;