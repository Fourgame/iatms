import { useState, useEffect, useRef } from 'react';
import { Card, Button as ButtonBootstrap } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { DatePicker, Select, Form, Input, Modal, Row, Col, Button } from 'antd';
import { SearchToolBtnBootstrap, ClearToolBtnBootstrap, AddToolBtnBootstrap, EditToolBtnBootstrap, DeleteToolBtn, Approve_RejectBtn, CloseModalBtnBootstrap, CloseIconBtn, ApproveModalBtnBootstrap, RejectModalBtnBootstrap } from '../../Utilities/Buttons/Buttons';
import { RejectTag, ApproveTag, PendingApproveTag } from "../../Utilities/StatusTag/StatusTag";
import TokenService from '../../../services/token.service';
import TableUI from '../../Utilities/Table/TableUI';
import { getDropdown } from '../../../services/dropdown.service';
import { getAttApproval, getModalAttApproval, postAttApproval } from '../../../services/att-approval.service';
import { noticeShowMessage } from '../../Utilities/Notification';
import Loading from "../../Utilities/Loading";
import moment from 'moment';
import Title from '../../Utilities/Title';
import { getLeaveApproval, postLeaveApproval } from '../../../services/leaveapproval.service';

const { Option } = Select;

const AttendanceApproval = ( {title} ) => {
    const navigate = useNavigate();

    const handleRequestError = (error) => {
        if (error.response) {
            const status = error.response.status;
            if (status === 401) {
                TokenService.deleteUser();
                navigate("/signin", { state: { message: "session expire" } });
                return true;
            }
            if (error.response.data && error.response.data.message) {
                noticeShowMessage(error.response.data.message, true);
                return false;
            }
            if (status === 403) {
                TokenService.deleteUser();
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

    // Dropdown Data
    const [teamList, setTeamList] = useState([]);

    // Attendance Approval Search State
    const [attKeyword, setAttKeyword] = useState('');
    const [attTeam, setAttTeam] = useState("ทั้งหมด");
    const [attOpenTeamDropdown, setAttOpenTeamDropdown] = useState(false);
    const [attApprovalData, setAttApprovalData] = useState([]);
    const attSearchFilterRef = useRef(null);

    // Leave Approval Search State
    const [leaveKeyword, setLeaveKeyword] = useState('');
    const [leaveTeam, setLeaveTeam] = useState("ทั้งหมด");
    const [leaveOpenTeamDropdown, setLeaveOpenTeamDropdown] = useState(false);
    const [leaveApprovalData, setLeaveApprovalData] = useState([]);
    const leaveSearchFilterRef = useRef(null);

    // Leave Detail Modal State
    const [isLeaveDetailModalOpen, setIsLeaveDetailModalOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [rejectReasonInput, setRejectReasonInput] = useState('');
    const [rejectReasonError, setRejectReasonError] = useState('');

    const [loading, setLoading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [attRejectReasonError, setAttRejectReasonError] = useState("");
    const [modalLoading, setModalLoading] = useState(false);

    const fetchAttApprovalData = async (keyword = '', team = "ทั้งหมด") => {
        setLoading(true);
        try {
            const payload = {
                Name: keyword || undefined,
                Team: team === "ทั้งหมด" ? undefined : (team || undefined)
            };
            const response = await getAttApproval.get_att_approval(payload);
            if (response && response.data) {
                setAttApprovalData(response.data);
            } else {
                setAttApprovalData([]);
            }
        } catch (error) {
            console.error("Error fetching attendance approval data:", error);
            handleRequestError(error);
            setAttApprovalData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = Title.get_title(title);
        const fetchDropdowns = async () => {
            try {
                const teamRes = await getDropdown.get_dropdown({ type: 'Team' });
                if (teamRes.data) {
                    setTeamList(teamRes.data);
                }
            } catch (error) {
                console.error("Error fetching dropdowns:", error);
            }
        };
        fetchDropdowns();
        fetchAttApprovalData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handlers for Attendance Approval
    const handleAttSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setAttOpenTeamDropdown(false);
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
            handleAttSearch();
        }
    };

    const handleAttSearch = () => {
        console.log("Search Attendance Approval:", { attKeyword, attTeam });
        fetchAttApprovalData(attKeyword, attTeam);
    };

    const handleAttClear = () => {
        setAttKeyword('');
        setAttTeam("ทั้งหมด");
        console.log("Clear Attendance Approval");
        fetchAttApprovalData('', "ทั้งหมด");
    };

    // Modal Handlers
    const handleOpenAttModal = async (record) => {
        setSelectedRecord(record);
        setRejectReason("");
        setModalData(null);
        setIsModalOpen(true);
        setModalLoading(true);

        try {
            const payload = {
                username: record.oaUser,
                Date: record.attDate
            };
            const response = await getModalAttApproval.get_modal_att_approval(payload);

            if (response && response.data) {
                const data = Array.isArray(response.data) ? response.data[0] : response.data;
                setModalData(data || {});
            } else {
                setModalData({});
                noticeShowMessage("ไม่พบข้อมูลรายละเอียด", true);
            }

        } catch (error) {
            console.error("Error fetching modal data:", error);
            handleRequestError(error);
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalData(null);
        setSelectedRecord(null);
        setRejectReason("");
        setAttRejectReasonError("");
    };

    const formatDateTime = (date, time) => {
        if (!date || !time) return null;
        let formattedTime = time.trim();
        if (formattedTime.length === 5) {
            formattedTime = `${formattedTime}:00`;
        }
        return `${date}T${formattedTime}`;
    };

    const handleSubmit = async (isApprove) => {
        if (!isApprove && !rejectReason.trim()) {
            setAttRejectReasonError("กรุณาระบุเหตุผลที่ปฏิเสธ");
            return;
        }

        setAttRejectReasonError("");

        const payload = {
            oa_user: selectedRecord?.oaUser || modalData?.oaUser || null,
            at_date: modalData?.attDate || null,
            isApprove: isApprove,

            ci_time_new: formatDateTime(modalData?.attDate, modalData?.ciTimeNew),
            ci_location_new: modalData?.ciLocationNew || null,
            ci_address_new: (modalData?.ciAddressNew && modalData.ciAddressNew.trim()) ? modalData.ciAddressNew : null,

            co_time_new: formatDateTime(modalData?.attDate, modalData?.coTimeNew),
            co_location_new: modalData?.coLocationNew || null,
            co_address_new: (modalData?.coAddressNew && modalData.coAddressNew.trim()) ? modalData.coAddressNew : null,

            rejectReason: isApprove ? null : rejectReason
        };

        console.log("Submit Payload:", payload);
        setModalLoading(true);

        try {
            const res = await postAttApproval.post_att_approval(payload);
            if (res && (res.status === 200 || res.data)) {
                noticeShowMessage("บันทึกข้อมูลสำเร็จ", false);
                handleCloseModal();
                fetchAttApprovalData(attKeyword, attTeam);
            } else {
                noticeShowMessage(res?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล", true);
            }
        } catch (error) {
            console.error("Error submit approval:", error);
            handleRequestError(error);
        } finally {
            setModalLoading(false);
        }
    };

    const handleApprove = () => handleSubmit(true);
    const handleReject = () => handleSubmit(false);

    // Handlers for Leave Approval
    const fetchLeaveApproval = async (clear = false) => {
        setLoading(true);
        try {
            const payload = {
                Search: clear ? null : (leaveKeyword || null),
                Team: clear ? null : (leaveTeam === "ทั้งหมด" ? null : (leaveTeam || null))
            };

            const cleanPayload = Object.fromEntries(
                Object.entries(payload).filter(([_, v]) => v != null && v !== "")
            );

            const response = await getLeaveApproval.get_leave_approval(cleanPayload);
            if (response.data) {
                const formattedData = response.data.map((item, index) => {
                    let parts = [];
                    const days = item.total_day ? parseInt(item.total_day, 10) : 0;
                    if (days > 0) {
                        parts.push(`${days} วัน`);
                    }

                    if (item.working_hour && item.working_hour !== "00:00:00") {
                        const timeParts = item.working_hour.split(':');
                        if (timeParts.length >= 2) {
                            const h = parseInt(timeParts[0], 10);
                            const m = parseInt(timeParts[1], 10);
                            if (h > 0) parts.push(`${h} ชั่วโมง`);
                            if (m > 0) parts.push(`${m} นาที`);
                        }
                    }

                    let durationDisplay = parts.length > 0 ? parts.join(' ') : '-';

                    return {
                        ...item,
                        key: index,
                        oa_user: item.oa_user,
                        fullname: item.full_name,
                        team: item.team,
                        leaveType: item.type_leave_display,
                        startDate: item.start_date ? moment(item.start_date).format('DD/MM/YYYY') : '-',
                        endDate: item.end_date ? moment(item.end_date).format('DD/MM/YYYY') : '-',
                        duration: durationDisplay,
                        period: item.start_time && item.end_time
                            ? `${moment(item.start_time).format('HH:mm')} - ${moment(item.end_time).format('HH:mm')}`
                            : '-',
                        reason: item.reason,
                        reject_reason: item.reject_reason,
                        status: item.status_display
                    };
                });
                setLeaveApprovalData(formattedData);
            } else {
                setLeaveApprovalData([]);
            }
        } catch (error) {
            console.error("Error fetching leave approval data:", error);
            handleRequestError(error);
            setLeaveApprovalData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveApproval();
    }, []);

    const handleLeaveSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setLeaveOpenTeamDropdown(false);
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
            handleLeaveSearch();
        }
    };

    const handleLeaveSearch = () => {
        fetchLeaveApproval();
    };

    const handleLeaveClear = () => {
        setLeaveKeyword('');
        setLeaveTeam("ทั้งหมด");
        fetchLeaveApproval(true);
    };

    const handleLeaveApprovalAction = async (action) => {
        if (!selectedLeave) return;

        if (action === 'Reject' && (!rejectReasonInput || rejectReasonInput.trim() === '')) {
            setRejectReasonError('* กรุณาระบุเหตุผลที่ปฏิเสธ');
            return;
        }

        setRejectReasonError('');
        setLoading(true);
        try {
            const payload = {
                oa_user: selectedLeave.oa_user,
                start_date: moment(selectedLeave.start_date).format('YYYY-MM-DD'),
                end_date: moment(selectedLeave.end_date).format('YYYY-MM-DD'),
                action: action,
                reject_reason: action === 'Reject' ? rejectReasonInput : null
            };

            const response = await postLeaveApproval.post_leave_approval(payload);
            if (response.data && response.data.message === "Success") {
                noticeShowMessage("บันทึกข้อมูลสำเร็จ", false);
                setIsLeaveDetailModalOpen(false);
                fetchLeaveApproval();
            }
        } catch (error) {
            console.error(`Error ${action} leave approval:`, error);
            handleRequestError(error);
        } finally {
            setLoading(false);
        }
    };

    // Columns for Attendance Approval
    const attApprovalColumns = [
        {
            title: '',
            key: 'action',
            width: 80,
            align: 'center',
            render: (text, record) => {
                return (
                    <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                        <Approve_RejectBtn onClick={() => handleOpenAttModal(record)} />
                    </div>
                );
            }
        },
        {
            title: 'วันที่',
            dataIndex: 'attDate',
            key: 'attDate',
            align: 'center',
            sorter: (a, b) => String(a.attDate ?? "").localeCompare(String(b.attDate ?? "")),
            width: 80,
            render: (text) => {
                if (!text) return "-";
                const [year, month, day] = text.split("-");
                return day && month && year ? `${day}/${month}/${year}` : text;
            }
        },
        {
            title: 'OA User',
            dataIndex: 'oaUser',
            key: 'oaUser',
            align: 'center',
            sorter: (a, b) => String(a.oaUser ?? "").localeCompare(String(b.oaUser ?? "")),
            width: 150,
        },
        {
            title: 'ชื่อ-นามสกุล',
            dataIndex: 'fullName',
            key: 'fullName',
            align: 'center',
            sorter: (a, b) => String(a.fullName ?? "").localeCompare(String(b.fullName ?? "")),
            width: 150,
        },
        {
            title: 'Team',
            dataIndex: 'team',
            key: 'team',
            align: 'center',
            sorter: (a, b) => String(a.team ?? "").localeCompare(String(b.team ?? "")),
            width: 100,
        },
        {
            title: 'เหตุผลคำขอ',
            dataIndex: 'requestReason',
            key: 'requestReason',
            align: 'left',
            sorter: (a, b) => String(a.requestReason ?? "").localeCompare(String(b.requestReason ?? "")),
            width: 150,
        },
        {
            title: 'Check-In',
            children: [
                {
                    title: 'เวลา (น.)',
                    dataIndex: 'ciTimeOld',
                    key: 'ciTimeOld',
                    align: 'center',
                    width: 70,
                    sorter: (a, b) => String(a.ciTimeOld ?? "").localeCompare(String(b.ciTimeOld ?? "")),
                    render: (text) => text ?? "-"
                },
                {
                    title: 'ตำแหน่ง',
                    dataIndex: 'ciAddressOld',
                    key: 'ciAddressOld',
                    align: 'left',
                    sorter: (a, b) => String(a.ciAddressOld ?? "").localeCompare(String(b.ciAddressOld ?? "")),
                    width: 120,
                    render: (text) => text ?? "-"
                },
                {
                    title: 'เหตุผล',
                    dataIndex: 'ciRequestReason',
                    key: 'ciRequestReason',
                    align: 'left',
                    sorter: (a, b) => String(a.ciRequestReason ?? "").localeCompare(String(b.ciRequestReason ?? "")),
                    width: 120,
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "center" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                },
                {
                    title: 'เวลาที่ขอแก้ไข (น.)',
                    dataIndex: 'ciTimeNew',
                    key: 'ciTimeNew',
                    align: 'center',
                    sorter: (a, b) => String(a.ciTimeNew ?? "").localeCompare(String(b.ciTimeNew ?? "")),
                    width: 70,
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "center" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                },
                {
                    title: 'ตำแหน่งที่ขอแก้ไข',
                    dataIndex: 'ciAddressNew',
                    key: 'ciAddressNew',
                    align: 'left',
                    sorter: (a, b) => String(a.ciAddressNew ?? "").localeCompare(String(b.ciAddressNew ?? "")),
                    width: 120,
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                }
            ]
        },
        {
            title: 'Check-Out',
            children: [
                {
                    title: 'เวลา (น.)',
                    dataIndex: 'coTimeOld',
                    key: 'coTimeOld',
                    align: 'center',
                    width: 70,
                    sorter: (a, b) => String(a.coTimeOld ?? "").localeCompare(String(b.coTimeOld ?? "")),
                    render: (text) => text ?? "-"
                },
                {
                    title: 'ตำแหน่ง',
                    dataIndex: 'coAddressOld',
                    key: 'coAddressOld',
                    align: 'left',
                    sorter: (a, b) => String(a.coAddressOld ?? "").localeCompare(String(b.coAddressOld ?? "")),
                    width: 120,
                    render: (text) => text ?? "-"
                },
                {
                    title: 'เหตุผล',
                    dataIndex: 'coRequestReason',
                    key: 'coRequestReason',
                    align: 'left',
                    sorter: (a, b) => String(a.coRequestReason ?? "").localeCompare(String(b.coRequestReason ?? "")),
                    width: 120,
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                },
                {
                    title: 'เวลาที่ขอแก้ไข (น.)',
                    dataIndex: 'coTimeNew',
                    key: 'coTimeNew',
                    align: 'center',
                    sorter: (a, b) => String(a.coTimeNew ?? "").localeCompare(String(b.coTimeNew ?? "")),
                    width: 70,
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "center" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                },
                {
                    title: 'ตำแหน่งที่ขอแก้ไข',
                    dataIndex: 'coAddressNew',
                    key: 'coAddressNew',
                    sorter: (a, b) => String(a.coAddressNew ?? "").localeCompare(String(b.coAddressNew ?? "")),
                    align: 'left',
                    width: 120,
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                }
            ]
        },
        {
            title: 'สถานะคำขอ',
            dataIndex: 'changeStatus',
            key: 'changeStatus',
            align: 'center',
            width: 80,
            render: (text, record) => {
                const status = record.changeStatusCode ? String(record.changeStatusCode).trim() : (text ? String(text).trim() : "-");
                const label = record.changeStatus || status;
                switch (status) {
                    case 'RJ':
                    case 'Rj': return <RejectTag text={label} />;
                    case 'AP':
                    case 'Ap': return <ApproveTag text={label} />;
                    case 'PA': return <PendingApproveTag text={label} />;
                    default: return label;
                }
            }
        },
    ];

    // Columns for Leave Approval
    const leaveApprovalColumns = [
        {
            title: '',
            key: 'action',
            width: 100,
            align: 'center',
            render: (text, record) => (
                <div style={{ textAlign: 'center' }}>
                    <Approve_RejectBtn onClick={() => {
                        setSelectedLeave(record);
                        setRejectReasonInput(record.reject_reason || '');
                        setRejectReasonError('');
                        setIsLeaveDetailModalOpen(true);
                    }} />
                </div>
            )
        },
        {
            title: 'OA User',
            dataIndex: 'oa_user',
            key: 'oa_user',
            align: 'left',
            sorter: (a, b) => String(a.oa_user ?? "").localeCompare(String(b.oa_user ?? "")),
            width: 50,
        },
        {
            title: 'ชื่อ-นามสกุล',
            dataIndex: 'fullname',
            key: 'fullname',
            align: 'left',
            sorter: (a, b) => String(a.fullname ?? "").localeCompare(String(b.fullname ?? "")),
            width: 160,
        },
        {
            title: 'Team',
            dataIndex: 'team',
            key: 'team',
            align: 'center',
            sorter: (a, b) => String(a.team ?? "").localeCompare(String(b.team ?? "")),
            width: 120,
        },
        {
            title: 'ประเภทการลา',
            dataIndex: 'leaveType',
            key: 'leaveType',
            align: 'center',
            sorter: (a, b) => String(a.leaveType ?? "").localeCompare(String(b.leaveType ?? "")),
            width: 140,
        },
        {
            title: 'วันที่เริ่มต้น',
            dataIndex: 'startDate',
            key: 'startDate',
            align: 'center',
            sorter: (a, b) => {
                const dateA = moment(a.startDate, 'DD/MM/YYYY');
                const dateB = moment(b.startDate, 'DD/MM/YYYY');
                if (dateA.isValid() && dateB.isValid()) return dateA.valueOf() - dateB.valueOf();
                return String(a.startDate ?? "").localeCompare(String(b.startDate ?? ""));
            },
            width: 90,
        },
        {
            title: 'วันที่สิ้นสุด',
            dataIndex: 'endDate',
            key: 'endDate',
            align: 'center',
            sorter: (a, b) => {
                const dateA = moment(a.endDate, 'DD/MM/YYYY');
                const dateB = moment(b.endDate, 'DD/MM/YYYY');
                if (dateA.isValid() && dateB.isValid()) return dateA.valueOf() - dateB.valueOf();
                return String(a.endDate ?? "").localeCompare(String(b.endDate ?? ""));
            },
            width: 90,
        },
        {
            title: 'ระยะเวลา',
            dataIndex: 'duration',
            key: 'duration',
            align: 'center',
            sorter: (a, b) => String(a.duration ?? "").localeCompare(String(b.duration ?? "")),
            width: 100,
        },
        {
            title: 'ช่วงเวลา',
            dataIndex: 'period',
            key: 'period',
            align: 'center',
            sorter: (a, b) => String(a.period ?? "").localeCompare(String(b.period ?? "")),
            width: 120,
        },
        {
            title: 'เหตุผล',
            dataIndex: 'reason',
            key: 'reason',
            align: 'left',
            sorter: (a, b) => String(a.reason ?? "").localeCompare(String(b.reason ?? "")),
            width: 150,
            render: (text) => (
                <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                    {text && text.trim() ? text : "-"}
                </div>
            ),
        },
        {
            title: 'สถานะ',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            sorter: (a, b) => String(a.status ?? "").localeCompare(String(b.status ?? "")),
            width: 120,
            render: (text, record) => {
                const statusLabel = text ? String(text).trim() : "-";
                if (statusLabel === "Pending Approval" || statusLabel === "Pending") return <PendingApproveTag text={statusLabel} />;
                if (statusLabel === "Approved") return <ApproveTag text={statusLabel} />;
                if (statusLabel === "Rejected") return <RejectTag text={statusLabel} />;
                return statusLabel;
            }
        },
    ];

    return (
        <div style={{ paddingLeft: '20px', paddingRight: '20px', paddingBottom: '40px', backgroundColor: '#e9ecef', minHeight: '80vh' }}>
            {loading && <Loading />}

            {/* Attendance Approval Card */}
            <Card
                className="shadow-sm border-0"
                style={{
                    borderRadius: "6px",
                    overflow: "hidden",
                    boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
                }}>
                <Card.Header
                    style={{
                        backgroundColor: "#A0BDFF",
                        padding: "14px 20px",
                        fontSize: "22px",
                        fontWeight: 600,
                        color: "black",
                        borderBottom: "1px solid #d9d9d9",
                    }}
                >
                    Attendance Approval
                </Card.Header>
                <Card.Body className="p-3">
                    <div
                        style={{ background: "white", borderRadius: "6px", outline: "none" }}
                        ref={attSearchFilterRef}
                        tabIndex={-1}
                        onKeyDown={handleAttSearchKeyDown}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: "15px",
                                background: "white",
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontWeight: 700, fontSize: '16px' }}>ชื่อ-นามสกุลหรือ OA User :</span>
                                <Input
                                    placeholder="กรอกชื่อ-นามสกุลหรือ OA User"
                                    value={attKeyword}
                                    onChange={(e) => setAttKeyword(e.target.value)}
                                    onKeyDown={handleAttSearchKeyDown}
                                    style={{ width: 250 }}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Form component={false}>
                                    <Form.Item label={<span style={{ fontWeight: 700, fontSize: '16px' }}>Team</span>} style={{ marginBottom: 0 }}>
                                        <Select
                                            placeholder="-เลือก-"
                                            value={attTeam}
                                            open={attOpenTeamDropdown}
                                            onDropdownVisibleChange={(open) => setAttOpenTeamDropdown(open)}
                                            onChange={(value) => {
                                                setAttTeam(value);
                                                requestAnimationFrame(() => attSearchFilterRef.current?.focus());
                                            }}
                                            style={{ width: 180 }}
                                            allowClear={false}
                                        >
                                            <Option value="ทั้งหมด">ทั้งหมด</Option>
                                            {teamList.map((item) => (
                                                <Option key={item.value} value={item.value}>{item.label}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Form>
                            </div>

                            <div style={{ marginLeft: "auto", display: 'flex', gap: '10px' }}>
                                <SearchToolBtnBootstrap onClick={handleAttSearch} />
                                <ClearToolBtnBootstrap onClick={handleAttClear} />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: "15px", maxWidth: "100%", overflowX: "auto" }}>
                        <div style={{ minWidth: "1200px" }}>
                            <TableUI
                                columns={attApprovalColumns}
                                dataSource={attApprovalData}
                                pagination={true}
                                bordered={true}
                                size="small"
                                rowSelection={undefined}
                                rowKey={(record, index) => record.id || index}
                            />
                        </div>
                    </div>

                </Card.Body>
            </Card>

            {/* Attendance Detail Modal */}
            <Modal
                title={
                    <div style={{
                        backgroundColor: '#2750B0',
                        color: 'white',
                        padding: '16px 24px',
                        margin: '-24px -24px 0 -24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '16px',
                        fontWeight: '600',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                    }}>
                        <span>Attendance Detail</span>
                    </div>
                }
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={null}
                width={1000}
                centered
                closeIcon={<CloseIconBtn />}
                className="attendance-detail-modal"
                styles={{ header: { padding: 0, borderBottom: 'none' }, body: { padding: '24px' }, content: { padding: 0, overflow: 'hidden', borderRadius: '8px' } }}
            >
                {modalLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <Loading />
                    </div>
                ) : (
                    <div
                        tabIndex={0}
                        ref={(input) => input && input.focus()}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleReject();
                            }
                        }}
                        style={{ marginTop: '10px', outline: 'none' }}
                    >
                        <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '15px' }}>
                            วันที่ &nbsp; {modalData?.attDate ? moment(modalData.attDate).format("DD/MM/YYYY") : "-"}
                        </div>

                        {/* Check-In Fieldset */}
                        <fieldset style={{ border: '2px solid #333', borderRadius: '8px', padding: '10px 20px 20px', marginBottom: '15px' }}>
                            <legend style={{ width: 'auto', padding: '0 10px', fontSize: '14px', fontWeight: 'bold', marginBottom: '0', float: 'none', lineHeight: '1' }}>
                                เวลาเข้า
                            </legend>
                            <div style={{ display: 'flex', marginBottom: '15px' }}>
                                <div style={{ width: '80px', fontWeight: 'bold' }}>เวลา</div>
                                <div style={{ flex: 1 }}>
                                    {modalData?.ciTimeNew ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span>{modalData?.ciTimeOld ? `${modalData.ciTimeOld} น.` : "-"}</span>
                                            <i className="bi bi-arrow-left-right" style={{ fontSize: '18px' }}></i>
                                            <span style={{ color: '#DC3545' }}>{`${modalData.ciTimeNew} น.`}</span>
                                        </div>
                                    ) : (
                                        <span>{modalData?.ciTimeOld ? `${modalData.ciTimeOld} น.` : "-"}</span>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', marginBottom: '15px' }}>
                                <div style={{ width: '80px', fontWeight: 'bold' }}>สถานที่</div>
                                <div style={{ flex: 1 }}>
                                    {modalData?.ciLocationNew || modalData?.ciAddressNew ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span>{modalData?.ciAddressOld || modalData?.ciLocationOld || "-"}</span>
                                            <i className="bi bi-arrow-left-right" style={{ fontSize: '18px' }}></i>
                                            <span style={{ color: '#DC3545' }}>{modalData?.ciAddressNew || modalData?.ciLocationNew || "-"}</span>
                                        </div>
                                    ) : (
                                        <span>{modalData?.ciAddressOld || modalData?.ciLocationOld || "-"}</span>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', marginBottom: '0' }}>
                                <div style={{ width: '80px', fontWeight: 'bold' }}>เหตุผล</div>
                                <div style={{ flex: 1 }}>{modalData?.ciRequestReason || "-"}</div>
                            </div>
                        </fieldset>

                        {/* Check-Out Fieldset */}
                        <fieldset style={{ border: '2px solid #333', borderRadius: '8px', padding: '10px 20px 20px', marginBottom: '15px' }}>
                            <legend style={{ width: 'auto', padding: '0 10px', fontSize: '14px', fontWeight: 'bold', marginBottom: '0', float: 'none', lineHeight: '1' }}>
                                เวลาออก
                            </legend>
                            <div style={{ display: 'flex', marginBottom: '15px' }}>
                                <div style={{ width: '80px', fontWeight: 'bold' }}>เวลา</div>
                                <div style={{ flex: 1 }}>
                                    {modalData?.coTimeNew ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span>{modalData?.coTimeOld ? `${modalData.coTimeOld} น.` : "-"}</span>
                                            <i className="bi bi-arrow-left-right" style={{ fontSize: '18px' }}></i>
                                            <span style={{ color: '#DC3545' }}>{`${modalData.coTimeNew} น.`}</span>
                                        </div>
                                    ) : (
                                        <span>{modalData?.coTimeOld ? `${modalData.coTimeOld} น.` : "-"}</span>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', marginBottom: '15px' }}>
                                <div style={{ width: '80px', fontWeight: 'bold' }}>สถานที่</div>
                                <div style={{ flex: 1 }}>
                                    {modalData?.coLocationNew || modalData?.coAddressNew ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span>{modalData?.coAddressOld || modalData?.coLocationOld || "-"}</span>
                                            <i className="bi bi-arrow-left-right" style={{ fontSize: '18px' }}></i>
                                            <span style={{ color: '#DC3545' }}>{modalData?.coAddressNew || modalData?.coLocationNew || "-"}</span>
                                        </div>
                                    ) : (
                                        <span>{modalData?.coAddressOld || modalData?.coLocationOld || "-"}</span>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', marginBottom: '0' }}>
                                <div style={{ width: '80px', fontWeight: 'bold' }}>เหตุผล</div>
                                <div style={{ flex: 1 }}>{modalData?.coRequestReason || "-"}</div>
                            </div>
                        </fieldset>

                        {/* Request Reason Fieldset */}
                        <fieldset style={{ border: '2px solid #333', borderRadius: '8px', padding: '10px 20px 20px', marginBottom: '15px' }}>
                            <legend style={{ width: 'auto', padding: '0 10px', fontSize: '14px', fontWeight: 'bold', marginBottom: '0', float: 'none', lineHeight: '1' }}>
                                เหตุผลที่ร้องขอ
                            </legend>
                            <div style={{ paddingLeft: '20px' }}>
                                {selectedRecord?.requestReason || selectedRecord?.ciRequestReason || selectedRecord?.coRequestReason || "-"}
                            </div>
                        </fieldset>

                        {/* Reject Reason Fieldset */}
                        <fieldset style={{ border: '2px solid #333', borderRadius: '8px', padding: '10px 20px 20px', marginBottom: '20px' }}>
                            <legend style={{ width: 'auto', padding: '0 10px', fontSize: '14px', fontWeight: 'bold', marginBottom: '0', float: 'none', lineHeight: '1' }}>
                                เหตุผลที่ Reject
                            </legend>
                            <Input.TextArea
                                placeholder="กรอกเหตุผลที่ Reject"
                                value={rejectReason}
                                onChange={(e) => {
                                    setRejectReason(e.target.value);
                                    if (e.target.value.trim() !== '') setAttRejectReasonError('');
                                }}
                                rows={2}
                                style={{ border: attRejectReasonError ? '1px solid red' : '1px solid #d9d9d9', resize: 'none' }}
                            />
                            {attRejectReasonError && <div style={{ color: 'red', marginTop: '5px', fontSize: '13px' }}>{attRejectReasonError}</div>}
                        </fieldset>

                        {/* Footer Buttons */}
                        <div className="modal-footer justify-content-center border-top-0 pb-0 pt-3" style={{ gap: '20px' }}>
                            <ApproveModalBtnBootstrap onClick={handleApprove} />
                            <RejectModalBtnBootstrap onClick={handleReject} style={{ "--bs-btn-bg": "#FFBCBC", "--bs-btn-hover-bg": "#ffcccc", "--bs-btn-active-bg": "#ffcccc" }} />

                            <CloseModalBtnBootstrap onClick={handleCloseModal} style={{ width: '150px', height: '40px', backgroundColor: '#E8E8E8', borderColor: '#000' }} />
                        </div>
                    </div>
                )}
            </Modal>

            {/* Leave Approval Card */}
            <Card
                className="shadow-sm border-0"
                style={{
                    borderRadius: "6px",
                    overflow: "hidden",
                    boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
                    marginTop: "30px",
                }}>
                <Card.Header
                    style={{
                        backgroundColor: "#A0BDFF",
                        padding: "14px 20px",
                        fontSize: "22px",
                        fontWeight: 600,
                        color: "black",
                        borderBottom: "1px solid #d9d9d9",
                    }}
                >
                    Leave Approval
                </Card.Header>
                <Card.Body className="p-3">
                    <div
                        style={{ background: "white", borderRadius: "6px", outline: "none" }}
                        ref={leaveSearchFilterRef}
                        tabIndex={-1}
                        onKeyDown={handleLeaveSearchKeyDown}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: "15px",
                                background: "white",
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontWeight: 700, fontSize: '16px' }}>ชื่อ-นามสกุลหรือ OA User :</span>
                                <Input
                                    placeholder="กรอกชื่อ-นามสกุลหรือ OA User"
                                    value={leaveKeyword}
                                    onChange={(e) => setLeaveKeyword(e.target.value)}
                                    onKeyDown={handleLeaveSearchKeyDown}
                                    style={{ width: 250 }}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Form component={false}>
                                    <Form.Item label={<span style={{ fontWeight: 700, fontSize: '16px' }}>Team</span>} style={{ marginBottom: 0 }}>
                                        <Select
                                            placeholder="-เลือก-"
                                            value={leaveTeam}
                                            open={leaveOpenTeamDropdown}
                                            onDropdownVisibleChange={(open) => setLeaveOpenTeamDropdown(open)}
                                            onChange={(value) => {
                                                setLeaveTeam(value);
                                                requestAnimationFrame(() => leaveSearchFilterRef.current?.focus());
                                            }}
                                            style={{ width: 180 }}
                                            allowClear={false}
                                        >
                                            <Option value="ทั้งหมด">ทั้งหมด</Option>
                                            {teamList.map((item) => (
                                                <Option key={item.value} value={item.value}>{item.label}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Form>
                            </div>

                            <div style={{ marginLeft: "auto", display: 'flex', gap: '10px' }}>
                                <SearchToolBtnBootstrap onClick={handleLeaveSearch} />
                                <ClearToolBtnBootstrap onClick={handleLeaveClear} />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: "15px", maxWidth: "100%", overflowX: "auto" }}>
                        <div style={{ minWidth: "1200px" }}>
                            <TableUI
                                columns={leaveApprovalColumns}
                                dataSource={leaveApprovalData}
                                pagination={true}
                                bordered={true}
                                size="large"
                                rowSelection={undefined}
                                rowKey={(record, index) => index}
                            />
                        </div>
                    </div>

                </Card.Body>
            </Card>

            <Modal
                title={
                    <div style={{
                        backgroundColor: '#2750B0',
                        color: 'white',
                        padding: '16px 24px',
                        margin: '-24px -24px 0 -24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '16px',
                        fontWeight: '600',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                    }}>
                        <span>Leave Detail</span>
                    </div>
                }
                open={isLeaveDetailModalOpen}
                onCancel={() => setIsLeaveDetailModalOpen(false)}
                footer={null}
                width={700}
                centered
                closeIcon={<CloseIconBtn />}
                className="leave-detail-modal"
                styles={{ header: { padding: 0, borderBottom: 'none' }, body: { padding: '24px' }, content: { padding: 0, overflow: 'hidden', borderRadius: '8px' } }}
            >
                {selectedLeave && (
                    <div style={{ marginTop: '10px', fontSize: '15px' }}>
                        {/* ข้อมูลลา Fieldset */}
                        <div
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleLeaveApprovalAction('Reject');
                                }
                            }}
                        >
                            {/* ข้อมูลลา Fieldset */}
                            <fieldset style={{ border: '2px solid #333', borderRadius: '8px', padding: '10px 20px 20px', marginBottom: '15px' }}>
                                <legend style={{ width: 'auto', padding: '0 10px', fontSize: '14px', fontWeight: 'bold', marginBottom: '0', float: 'none', lineHeight: '1' }}>
                                    ข้อมูลลา
                                </legend>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex' }}><span style={{ width: '130px', fontWeight: 'bold' }}>ประเภทการลา</span><span>{selectedLeave.type_leave_display || '-'}</span></div>
                                    <div style={{ display: 'flex' }}><span style={{ width: '130px', fontWeight: 'bold' }}>วันที่เริ่มต้น</span>
                                        <span>{selectedLeave.start_date ? moment(selectedLeave.start_date).format('DD/MM/YYYY') : '-'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ width: '130px', fontWeight: 'bold' }}>วันที่สิ้นสุด</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <span>{selectedLeave.end_date ? moment(selectedLeave.end_date).format('DD/MM/YYYY') : '-'}</span>
                                        </div>
                                    </div>
                                    {selectedLeave.start_time && (
                                        <div style={{ display: 'flex' }}><span style={{ width: '130px', fontWeight: 'bold' }}>ช่วงเวลาเริ่มต้น</span><span>{moment(selectedLeave.start_time).format('HH:mm')} น.</span></div>
                                    )}
                                    {selectedLeave.end_time && (
                                        <div style={{ display: 'flex' }}><span style={{ width: '130px', fontWeight: 'bold' }}>ช่วงเวลาสิ้นสุด</span><span>{moment(selectedLeave.end_time).format('HH:mm')} น.</span></div>
                                    )}
                                    <div style={{ display: 'flex' }}><span style={{ width: '130px', fontWeight: 'bold' }}>ระยะเวลา</span><span>{selectedLeave.duration || '-'}</span></div>
                                </div>
                            </fieldset>

                            {/* เหตุผลที่ร้องขอ Fieldset */}
                            <fieldset style={{ border: '2px solid #333', borderRadius: '8px', padding: '10px 20px 20px', marginBottom: '15px' }}>
                                <legend style={{ width: 'auto', padding: '0 10px', fontSize: '14px', fontWeight: 'bold', marginBottom: '0', float: 'none', lineHeight: '1' }}>
                                    เหตุผลที่ร้องขอ
                                </legend>
                                <div style={{ paddingLeft: '20px' }}>
                                    {selectedLeave.reason || '-'}
                                </div>
                            </fieldset>

                            {/* เหตุผลที่ Reject Fieldset */}
                            <fieldset style={{ border: '2px solid #333', borderRadius: '8px', padding: '10px 20px 20px', marginBottom: '20px' }}>
                                <legend style={{ width: 'auto', padding: '0 10px', fontSize: '14px', fontWeight: 'bold', marginBottom: '0', float: 'none', lineHeight: '1' }}>
                                    เหตุผลที่ Reject
                                </legend>
                                <Input.TextArea
                                    placeholder="กรอกเหตุผลที่ Reject"
                                    value={rejectReasonInput}
                                    onChange={(e) => {
                                        setRejectReasonInput(e.target.value);
                                        if (e.target.value.trim() !== '') setRejectReasonError('');
                                    }}
                                    rows={2}
                                    style={{ border: rejectReasonError ? '1px solid red' : '1px solid #d9d9d9', resize: 'none' }}
                                />
                                {rejectReasonError && <div style={{ color: 'red', marginTop: '5px', fontSize: '13px' }}>{rejectReasonError}</div>}
                            </fieldset>

                            {/* Footer Buttons */}
                            <div className="modal-footer justify-content-center border-top-0 pb-0 pt-3" style={{ gap: '20px' }}>
                                <ApproveModalBtnBootstrap onClick={() => handleLeaveApprovalAction('Approve')} />
                                <RejectModalBtnBootstrap onClick={() => handleLeaveApprovalAction('Reject')} style={{ "--bs-btn-bg": "#FFBCBC", "--bs-btn-hover-bg": "#ffcccc", "--bs-btn-active-bg": "#ffcccc" }} />

                                <CloseModalBtnBootstrap onClick={() => setIsLeaveDetailModalOpen(false)} style={{ width: '150px', height: '40px', backgroundColor: '#E8E8E8', borderColor: '#000' }} />
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AttendanceApproval;
