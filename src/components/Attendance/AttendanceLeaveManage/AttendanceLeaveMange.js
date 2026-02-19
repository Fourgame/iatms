import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { DatePicker, Select, Form } from 'antd';
import { SearchToolBtnBootstrap, ClearToolBtnBootstrap, AddToolBtnBootstrap, EditToolBtnBootstrap, DeleteToolBtn } from '../../Utilities/Buttons/Buttons';
import { RejectTag, ApproveTag, PendingApproveTag } from "../../Utilities/StatusTag/StatusTag";
import { getAttChange } from '../../../services/att-change.service';
import { getLeave } from '../../../services/leave.service';
import TokenService from '../../../services/token.service';
import TableUI from '../../Utilities/Table/TableUI';
import { getDropdown } from '../../../services/dropdown.service';
import { noticeShowMessage } from '../../Utilities/Notification';
import Loading from "../../Utilities/Loading";
import moment from 'moment';

const { Option } = Select;

const AttendanceLeaveMange = () => {
    // Attendance Change State
    const [attStartDate, setAttStartDate] = useState(null);
    const [attEndDate, setAttEndDate] = useState(null);
    const [attStatus, setAttStatus] = useState("ทั้งหมด");
    const [attStatusList, setAttStatusList] = useState([]);
    const [attChangeData, setAttChangeData] = useState([]);
    const [originalData, setOriginalData] = useState([]);

    // Leave Request State
    const [leaveStartDate, setLeaveStartDate] = useState(null);
    const [leaveEndDate, setLeaveEndDate] = useState(null);
    const [leaveStatus, setLeaveStatus] = useState("ทั้งหมด");
    // const [leaveStatusList, setLeaveStatusList] = useState([]); // Use status tag if API fails
    // But since user tried LeaveStatus, let's keep it consistent or use fixed list based on "status tag"
    // "pull status from status tag" implies hardcoded list matching tags?
    // Let's use a fixed list based on tags: Reject, Approve, Pending Approve
    // Or if there is an API, use it. But I should add the state anyway.
    const [leaveStatusList, setLeaveStatusList] = useState([]);
    const [leaveHistory, setLeaveHistory] = useState([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Fetch Dropdowns
                const attDropdownResponse = await getDropdown.get_dropdown({ type: 'AttendanceChangeStatus' });
                if (attDropdownResponse.data) {
                    setAttStatusList(attDropdownResponse.data);
                }

                const leaveDropdownResponse = await getDropdown.get_dropdown({ type: 'LeaveStatus' });
                if (leaveDropdownResponse.data) {
                    setLeaveStatusList(leaveDropdownResponse.data);
                }

                // Fetch Attendance Change
                const attChangeResponse = await getAttChange.get_att_change();
                if (attChangeResponse.data) {
                    setAttChangeData(attChangeResponse.data);
                    setOriginalData(attChangeResponse.data);
                }

                // Fetch Leave Data
                await fetchLeaveData();

            } catch (error) {
                console.error("Error fetching initial data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const fetchLeaveData = async (searchParams = {}) => {
        try {
            const user = TokenService.getUser();
            const username = user?.profile?.oa_user;
            if (username) {
                const payload = {
                    username: username,
                    startDate: searchParams.startDate || null,
                    endDate: searchParams.endDate || null,
                    status: searchParams.status || null
                };

                const cleanPayload = Object.fromEntries(
                    Object.entries(payload).filter(([_, v]) => v != null && v !== "")
                );

                const response = await getLeave.get_leave(cleanPayload);
                if (response.data) {
                    const formattedData = response.data.map((item, index) => {
                        let durationDisplay = '-';
                        if (item.total_hours) {
                            if (item.total_hours >= 24) {
                                const days = Math.floor(item.total_hours / 24);
                                const workHours = days * 8;
                                durationDisplay = `${days} วัน, ${workHours} ชั่วโมง`;
                            } else {
                                durationDisplay = `${item.total_hours} ชั่วโมง`;
                            }
                        }

                        return {
                            ...item,
                            key: index,
                            duration: durationDisplay,
                            timeRange: item.start_time && item.end_time
                                ? `${moment(item.start_time).format('HH:mm')} - ${moment(item.end_time).format('HH:mm')}`
                                : '-',
                            startDate: item.start_date ? moment(item.start_date).format('DD/MM/YYYY') : '-',
                            endDate: item.end_date ? moment(item.end_date).format('DD/MM/YYYY') : '-'
                        };
                    });
                    setLeaveHistory(formattedData);
                } else {
                    setLeaveHistory([]);
                }
            }
        } catch (error) {
            console.error("Error fetching leave data:", error);
            setLeaveHistory([]);
        }
    };

    // --- Attendance Change Handlers ---
    const handleAttSearch = async () => {
        if (attEndDate && !attStartDate) {
            noticeShowMessage("กรุณากรอกวันที่เริ่มต้น", true);
            return;
        }

        setLoading(true);
        try {
            const attPayload = {
                startDate: attStartDate ? attStartDate.format("YYYY/MM/DD") : null,
                endDate: attEndDate ? attEndDate.format("YYYY/MM/DD") : null,
                dropdown: attStatus === "ทั้งหมด" ? null : attStatus
            };

            const attResponse = await getAttChange.get_att_change(attPayload);
            if (attResponse.data) {
                setAttChangeData(attResponse.data);
            }
        } catch (error) {
            console.error("Error searching attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAttClear = () => {
        setAttStartDate(null);
        setAttEndDate(null);
        setAttStatus("ทั้งหมด");

        setLoading(true);
        getAttChange.get_att_change().then(res => {
            if (res.data) {
                setAttChangeData(res.data);
                setOriginalData(res.data);
            }
        }).finally(() => setLoading(false));
    };

    // --- Leave Request Handlers ---
    const handleLeaveSearch = async () => {
        if (leaveEndDate && !leaveStartDate) {
            noticeShowMessage("กรุณากรอกวันที่เริ่มต้น", true);
            return;
        }

        setLoading(true);
        try {
            const leaveParams = {
                startDate: leaveStartDate ? leaveStartDate.format("YYYY-MM-DD") : null,
                endDate: leaveEndDate ? leaveEndDate.format("YYYY-MM-DD") : null,
                status: leaveStatus === "ทั้งหมด" ? null : leaveStatus
            };
            await fetchLeaveData(leaveParams);
        } catch (error) {
            console.error("Error searching leave:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveClear = () => {
        setLeaveStartDate(null);
        setLeaveEndDate(null);
        setLeaveStatus("ทั้งหมด");

        setLoading(true);
        fetchLeaveData().finally(() => setLoading(false));
    };

    const attColumns = [
        {
            title: '',
            key: 'action',
            render: (text, record) => (
                <div style={{ textAlign: 'center', display: 'flex', gap: '5px', justifyContent: 'center' }}>
                    {record.action === 'edit' && <EditToolBtnBootstrap onClick={() => console.log("Edit", record)} />}
                    {record.action === 'delete' && <DeleteToolBtn onClick={() => console.log("Delete", record)} />}
                </div>
            ),
            width: 80,
            align: 'center'
        },
        {
            title: 'วันที่',
            dataIndex: 'attDate',
            key: 'attDate',
            align: 'left',
            width: 100,
            sorter: (a, b) => {
                const dateA = a.attDate || '';
                const dateB = b.attDate || '';
                return dateA.localeCompare(dateB);
            },
            render: (text) => {
                if (!text) return "-";
                const parts = text.includes('-') ? text.split('-') : text.split('/');
                if (parts.length === 3) {
                    return `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
                return text;
            }
        },
        {
            title: 'เหตุผลคำขอ',
            dataIndex: 'requestReason',
            key: 'requestReason',
            align: 'left',
            width: 150,
            sorter: (a, b) => String(a.requestReason ?? "").localeCompare(String(b.requestReason ?? "")),
            render: (text) => (
                <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                    {text && text.trim() ? text : "-"}
                </div>
            ),
        },
        {
            title: 'Check-In',
            children: [
                {
                    title: 'เวลา (น.)',
                    dataIndex: 'ciTime',
                    key: 'ciTime',
                    align: 'center',
                    width: 80,
                    sorter: (a, b) => String(a.ciTime ?? "").localeCompare(String(b.ciTime ?? "")),
                    render: (text) => text ?? "-"
                },
                {
                    title: 'ตำแหน่ง',
                    dataIndex: 'ciLocation',
                    key: 'ciLocation',
                    align: 'center',
                    width: 120,
                    render: (text) => text ?? "-"
                },
                {
                    title: 'เหตุผล',
                    dataIndex: 'ciReason',
                    key: 'ciReason',
                    align: 'left',
                    width: 120,
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                },
                {
                    title: 'เวลาที่ขอแก้ไข (น.)',
                    dataIndex: 'ciTimeNew',
                    key: 'ciTimeNew',
                    align: 'center',
                    width: 120,
                    render: (text) => text ?? "-"
                },
                {
                    title: 'ตำแหน่งที่ขอแก้ไข',
                    dataIndex: 'ciLocationNew',
                    key: 'ciLocationNew',
                    align: 'center',
                    width: 120,
                    render: (text) => text ?? "-"
                }
            ]
        },
        {
            title: 'Check-Out',
            children: [
                {
                    title: 'เวลา (น.)',
                    dataIndex: 'coTime',
                    key: 'coTime',
                    align: 'center',
                    width: 80,
                    sorter: (a, b) => String(a.coTime ?? "").localeCompare(String(b.coTime ?? "")),
                    render: (text) => text ?? "-"
                },
                {
                    title: 'ตำแหน่ง',
                    dataIndex: 'coLocation',
                    key: 'coLocation',
                    align: 'center',
                    width: 120,
                    render: (text) => text ?? "-"
                },
                {
                    title: 'เหตุผล',
                    dataIndex: 'coReason',
                    key: 'coReason',
                    align: 'left',
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
                    width: 120,
                    render: (text) => text ?? "-"
                },
                {
                    title: 'ตำแหน่งที่ขอแก้ไข',
                    dataIndex: 'coLocationNew',
                    key: 'coLocationNew',
                    align: 'center',
                    width: 120,
                    render: (text) => text ?? "-"
                }
            ]
        },
        {
            title: 'สถานะคำขอ',
            dataIndex: 'changeStatus',
            key: 'changeStatus',
            align: 'center',
            width: 120,
            sorter: (a, b) => String(a.changeStatus ?? "").localeCompare(String(b.changeStatus ?? "")),

            render: (text) => {
                const status = text ? String(text).trim() : "-";
                switch (status) {
                    case 'Rj': return <RejectTag />;
                    case 'Ap': return <ApproveTag />;
                    case 'PA': return <PendingApproveTag />;
                    default: return status;
                }
            }
        }
    ];

    const leaveColumns = [
        {
            title: (
                <div style={{ textAlign: 'center' }}>
                    <AddToolBtnBootstrap onClick={() => console.log("Add Leave Request")} />
                </div>
            ),
            key: 'action',
            render: (text, record) => (
                <div style={{ textAlign: 'center' }}>
                    <EditToolBtnBootstrap onClick={() => console.log("Edit Leave", record)} />
                </div>
            ),
            width: 100,
            align: 'center'
        },
        {
            title: 'ประเภทวันลา',
            dataIndex: 'type_leave',
            key: 'type_leave',
            align: 'center',
            width: 150
        },
        {
            title: 'สถานะ',
            dataIndex: 'status_request',
            key: 'status_request',
            align: 'center',
            width: 120,
            sorter: (a, b) => String(a.status_request ?? "").localeCompare(String(b.status_request ?? "")),
            render: (text) => {
                const status = text ? String(text).trim() : "-";
                switch (status) {
                    case 'Rejected': return <RejectTag />;
                    case 'Approved': return <ApproveTag />;
                    case 'Pending Approval': return <PendingApproveTag />;
                    default: return status;
                }
            }
        },
        {
            title: 'วันที่เริ่มต้น',
            dataIndex: 'startDate',
            key: 'startDate',
            align: 'center',
            width: 120
        },
        {
            title: 'วันที่สิ้นสุด',
            dataIndex: 'endDate',
            key: 'endDate',
            align: 'center',
            width: 120
        },
        {
            title: 'ระยะเวลา',
            dataIndex: 'duration',
            key: 'duration',
            align: 'center',
            width: 120
        },
        {
            title: 'ช่วงเวลา (น.)',
            dataIndex: 'timeRange',
            key: 'timeRange',
            align: 'center',
            width: 120
        },
        {
            title: 'เหตุผล',
            dataIndex: 'reason',
            key: 'reason',
            width: 200
        }
    ];

    return (
        <div style={{ paddingLeft: '20px', paddingRight: '20px', paddingBottom: '40px', backgroundColor: '#e9ecef', minHeight: '80vh' }}>
            {loading && <Loading />}

            {/* Attendance Change Card */}
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
                    Attendance Change
                </Card.Header>
                <Card.Body className="p-3">
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
                            <span style={{ fontWeight: 700, fontSize: '16px' }}>วันที่:</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    placeholder="DD/MM/YYYY"
                                    inputReadOnly={true}
                                    value={attStartDate}
                                    onChange={(date) => setAttStartDate(date)}
                                    style={{ width: 140 }}
                                />
                                <span>-</span>
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    placeholder="DD/MM/YYYY"
                                    inputReadOnly={true}
                                    value={attEndDate}
                                    onChange={(date) => setAttEndDate(date)}
                                    style={{ width: 140 }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Form component={false}>
                                <Form.Item label={<span style={{ fontWeight: 700, fontSize: '16px' }}>สถานะคำขอ:</span>} style={{ marginBottom: 0 }}>
                                    <Select
                                        placeholder="-เลือก-"
                                        value={attStatus}
                                        onChange={(value) => setAttStatus(value)}
                                        style={{ width: 150 }}
                                    >
                                        <Option value="ทั้งหมด">ทั้งหมด</Option>
                                        {attStatusList.map((item) => (
                                            <Option key={item.value} value={item.value}>{item.label}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Form>
                        </div>

                        <div style={{ marginLeft: "auto", display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <SearchToolBtnBootstrap onClick={handleAttSearch} />
                            <ClearToolBtnBootstrap onClick={handleAttClear} />
                        </div>
                    </div>
                    <div style={{ marginTop: "5px" }}>
                        <TableUI
                            columns={attColumns}
                            dataSource={attChangeData}
                            pagination={true}
                            bordered={true}
                            size="small"
                            rowKey={(record, index) => index}
                        />
                    </div>
                </Card.Body>
            </Card>

            {/* Leave Request Card */}
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
                    Leave Request
                </Card.Header>
                <Card.Body className="p-3">
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
                            <span style={{ fontWeight: 700, fontSize: '16px' }}>วันที่:</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    placeholder="DD/MM/YYYY"
                                    inputReadOnly={true}
                                    value={leaveStartDate}
                                    onChange={(date) => setLeaveStartDate(date)}
                                    style={{ width: 140 }}
                                />
                                <span>-</span>
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    placeholder="DD/MM/YYYY"
                                    inputReadOnly={true}
                                    value={leaveEndDate}
                                    onChange={(date) => setLeaveEndDate(date)}
                                    style={{ width: 140 }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Form component={false}>
                                <Form.Item label={<span style={{ fontWeight: 700, fontSize: '16px' }}>สถานะคำขอ:</span>} style={{ marginBottom: 0 }}>
                                    <Select
                                        placeholder="-เลือก-"
                                        value={leaveStatus}
                                        onChange={(value) => setLeaveStatus(value)}
                                        style={{ width: 150 }}
                                    >
                                        <Option value="ทั้งหมด">ทั้งหมด</Option>
                                        {leaveStatusList.map((item) => (
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
                    <div style={{ marginTop: "5px" }}>
                        <TableUI
                            columns={leaveColumns}
                            dataSource={leaveHistory}
                            pagination={false}
                            bordered={true}
                            size="small"
                            loading={loading}
                        />
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default AttendanceLeaveMange;