import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import token from "../../services/token.service";
import profileService from "../../services/profile.service";
import Title from "../../components/Utilities/Title";
import { noticeShowMessage } from "../../components/Utilities/Notification";
import authService from "../../services/auth.service";
import homeService from "../../services/home.service";
const StatCard = ({ title, value, footer, bg, hoverBg, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="border border-1 border-secondary p-2 d-flex flex-column h-100 rounded"
            style={{
                backgroundColor: isHovered && onClick ? (hoverBg || "#e9ecef") : (bg || "#ffffff"),
                cursor: onClick ? "pointer" : "default",
                boxShadow: isHovered && onClick ? "0 .5rem 1rem rgba(0,0,0,.15)" : "0 .125rem .25rem rgba(0,0,0,.075)",
                transition: "all 0.2s ease-in-out"
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            <div className="small text-muted">{title}</div>
            <div
                className="flex-grow-1 d-flex justify-content-center align-items-center fw-bold text-center"
                style={{ fontSize: "18px", whiteSpace: "pre-line" }}
            >
                {value}
            </div>
            {footer && <div className="small text-center">{footer}</div>}
        </div>
    );
};



const Home = ({ title }) => {
    let navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);

    const onPageLoad = async () => {
        try {
            const profileRes = await profileService.getProfile();
            setUser(profileRes.data);

            const dashboardRes = await homeService.getHomeDashboard();
            setDashboardData(dashboardRes.data);
        } catch (error) {
            handleRequestError(error);
        }
    };

    const handleRequestError = (error) => {
        if (error.response) {
            const status = error.response.status;
            if (status === 401) {
                token.deleteUser();
                navigate("/signin", { state: { message: "please sign-in again." } });
                return true;
            }
            if (error.response.data && error.response.data.message) {
                noticeShowMessage(error.response.data.message, true);
                return false;
            }
            if (status === 403) {
                token.deleteUser();
                navigate("/signin", { state: { message: "access-denied" } });
                return true;
            }
            if (status === 404) {
                navigate("/signin", { state: { message: "not-found" } });
                return true;
            }

        } else if (error.request) {
            console.log("No response received:", error.request);
            return navigate("/signin", { state: { message: "network-error" } });

        } else {
            console.log("Error setting up request:", error.message);
            return navigate("/signin", { state: { message: "error" } });
        }
        return false;
    };


    useEffect(() => {
        document.title = Title.get_title(title);
        if (!token.isSignIn()) {
            return navigate("/signin");

        } else {
            onPageLoad();
        }

    }, []);

    if (!user || !user.profile || !dashboardData) {
        return null;
    }

    const {
        menu_intern, menu_teamled, menu_manager,
        check_in, check_out, working_hour, ci_address, co_address,
        approve, pending, reject,
        check_in_summary, ci_late_count, ci_outside_count,
        co_summary, co_early_count, co_outside_count,
        pending_requests, displaydate
    } = dashboardData.length ? dashboardData[0] : dashboardData;

    const currentUser = token.getUser();
    const canCico = currentUser?.role?.func_cico;
    const canRpWorkHours = currentUser?.role?.func_rp_work_hours;
    const canRpAttendance = currentUser?.role?.func_rp_attendance;
    const canApprove = currentUser?.role?.func_approve;

    const renderInternDashboard = () => {
        let timeString = "-";
        if (working_hour && working_hour !== "00:00:00") {
            const timeParts = working_hour.split(':');
            if (timeParts.length >= 2) {
                const h = parseInt(timeParts[0], 10);
                const m = parseInt(timeParts[1], 10);
                timeString = m > 0 ? (h > 0 ? `${h} ชั่วโมง ${m} นาที` : `${m} นาที`) : `${h} ชั่วโมง`;
            }
        } else if (working_hour === "00:00:00") {
            timeString = "0 นาที";
        }

        let statusText = "-";
        if (check_out && check_out !== "-") statusText = "Check-Out";
        else if (check_in && check_in !== "-") statusText = "Check-In";
        else statusText = "ยังไม่เช็คอิน";

        return (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gridAutoRows: "minmax(140px, auto)",
                    alignContent: "start",
                    gap: "0.5rem",
                }}
            >
                {canCico && <StatCard onClick={() => navigate("/attendance/Check-In-&-Check-Out")} title="สถานะ" value={statusText} />}
                {canCico && <StatCard onClick={() => navigate("/attendance/Check-In-&-Check-Out")} title="เวลาที่เช็คอิน" value={check_in !== "-" && check_in ? `${check_in} น.` : "-"} />}
                {canCico && <StatCard onClick={() => navigate("/attendance/Check-In-&-Check-Out")} title="เวลาเช็คเอาท์" value={check_out !== "-" && check_out ? `${check_out} น.` : "-"} />}

                <StatCard onClick={canRpWorkHours ? () => navigate("/report/Work-Hours") : null} title="จำนวนชั่วโมงสะสม" value={timeString} />
                {canCico && <StatCard onClick={() => navigate("/attendance/Check-In-&-Check-Out")} title="สถานที่เช็คอิน" value={ci_address || "-"} />}
                {canCico && <StatCard onClick={() => navigate("/attendance/Check-In-&-Check-Out")} title="สถานที่เช็คเอาท์" value={co_address || "-"} />}

                {canCico && <StatCard onClick={() => navigate("/attendance/Attendance-&-Leave-Management")} title="คำร้องอนุมัติ" value={approve || "0"} footer="รายการ" bg="#c9ffd9" hoverBg="#A8EBB8" />}
                {canCico && <StatCard onClick={() => navigate("/attendance/Attendance-&-Leave-Management")} title="คำร้องรออนุมัติ" value={pending || "0"} footer="รายการ" bg="#fff0c9" hoverBg="#FFE099" />}
                {canCico && <StatCard onClick={() => navigate("/attendance/Attendance-&-Leave-Management")} title="คำร้องไม่อนุมัติ" value={reject || "0"} footer="รายการ" bg="#ffd0d0" hoverBg="#FFB2B2" />}
            </div>
        );
    };

    const renderManagerDashboard = () => {
        return (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gridAutoRows: "minmax(140px, auto)",
                    alignContent: "start",
                    gap: "0.5rem",
                }}
            >
                {canRpAttendance && check_in_summary !== "-" && <StatCard onClick={() => navigate("/report/AttendanceHistory")} title="จำนวนคนที่เช็คอิน" value={check_in_summary || "0/0"} footer="คน" />}
                {canRpAttendance && ci_late_count !== "-" && <StatCard onClick={() => navigate("/report/AttendanceHistory")} title="จำนวนคนที่เช็คอินเกินเวลา" value={ci_late_count || "0/0"} footer="คน" />}
                {canRpAttendance && ci_outside_count !== "-" && <StatCard onClick={() => navigate("/report/AttendanceHistory")} title="จำนวนคนที่เช็คอินนอกสถานที่" value={ci_outside_count || "0/0"} footer="คน" />}

                {canRpAttendance && co_summary !== "-" && <StatCard onClick={() => navigate("/report/AttendanceHistory")} title="จำนวนคนที่เช็คเอาท์" value={co_summary || "0/0"} footer="คน" />}
                {canRpAttendance && co_early_count !== "-" && <StatCard onClick={() => navigate("/report/AttendanceHistory")} title="จำนวนคนที่เช็คเอาท์ก่อนเวลา" value={co_early_count || "0/0"} footer="คน" />}
                {canRpAttendance && co_outside_count !== "-" && <StatCard onClick={() => navigate("/report/AttendanceHistory")} title="จำนวนคนที่เช็คเอาท์นอกสถานที่" value={co_outside_count || "0/0"} footer="คน" />}

                {canApprove && pending_requests !== -1 && <StatCard onClick={() => navigate("/attendance/Attendance-&-Leave-Approval")} title="คำร้องรออนุมัติ" value={pending_requests || "0"} footer="รายการ" bg="#fff0c9" hoverBg="#FFE099" />}
            </div>
        );
    };

    return (
        <div className="d-flex gap-3 p-3 my-3" style={{ minHeight: "70vh" }}>
            {/* LEFT BOX */}
            <div
                className="border border-2 border-secondary p-3"
                style={{ backgroundColor: "#F5F5F5", flex: 1, minWidth: 0 }}
            >
                <div className="fw-bold fs-1 mb-3 text-start">{user.profile.name_en}</div>
                <div className="text-start" style={{ fontSize: "14px", lineHeight: "28px", wordBreak: "break-word", overflowWrap: "break-word" }}>
                    <div className="fs-4   mb-3">
                        <span className="fw-medium fs-4 ">OA User :</span> {user.profile.oa_user}
                    </div>
                    <div className="fs-4  mb-3">
                        <span className="fw-medium  ">Email :</span> {user.profile.email}
                    </div>
                    <div className="fs-4  mb-3">
                        <span className="fw-medium ">Role :</span> {user.profile.role_id}
                    </div>
                    <div className="fs-4  mb-3">
                        <span className="fw-medium  ">Division :</span> {user.profile.division_code}
                    </div>
                    <div className="fs-4  mb-3">
                        <span className="fw-medium  ">Team :</span> {user.profile.team}
                    </div>
                    <div className="fs-4  mb-3">
                        <span className="fw-medium  ">Workplace :</span> {user.profile.work_Place}
                    </div>
                </div>
            </div>

            {/* RIGHT */}
            {menu_manager || menu_teamled || menu_intern ? (
                <div
                    className="border border-2 border-secondary p-2 d-flex flex-column"
                    style={{ backgroundColor: "#F5F5F5", flex: 1, minWidth: 0 }}
                >
                    <div className="text-center fw-bold mb-2">
                        ข้อมูล ณ วันที่ {displaydate || "-"}
                    </div>

                    {menu_manager || menu_teamled ? renderManagerDashboard() : renderInternDashboard()}
                </div>
            ) : (
                <div style={{ flex: 1 }}></div>
            )}
        </div>
    );
};

export default Home;

