import { useState, useEffect } from 'react';
import { Card, Button as ButtonBootstrap } from 'react-bootstrap';
import { DatePicker, Select, Form, Input, Modal } from 'antd';
import { SearchToolBtnBootstrap, ClearToolBtnBootstrap, AddToolBtnBootstrap, EditToolBtnBootstrap, DeleteToolBtn, Approve_RejectBtn } from '../../Utilities/Buttons/Buttons';
import { RejectTag, ApproveTag, PendingApproveTag } from "../../Utilities/StatusTag/StatusTag";
import TokenService from '../../../services/token.service';
import TableUI from '../../Utilities/Table/TableUI';
import { getDropdown } from '../../../services/dropdown.service';
import { noticeShowMessage } from '../../Utilities/Notification';
import Loading from "../../Utilities/Loading";
import moment from 'moment';
import { getLeaveApproval } from '../../../services/leaveapproval.service';

const { Option } = Select;

const AttendanceApproval = () => {
    // Dropdown Data
    const [teamList, setTeamList] = useState([]);

    // Attendance Approval Search State
    const [attKeyword, setAttKeyword] = useState('');
    const [attTeam, setAttTeam] = useState(undefined);

    // Leave Approval Search State
    const [leaveKeyword, setLeaveKeyword] = useState('');
    const [leaveTeam, setLeaveTeam] = useState(undefined);
    const [leaveApprovalData, setLeaveApprovalData] = useState([]);

    // Leave Detail Modal State
    const [isLeaveDetailModalOpen, setIsLeaveDetailModalOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [rejectReasonInput, setRejectReasonInput] = useState('');
    const [rejectReasonError, setRejectReasonError] = useState('');

    const [loading, setLoading] = useState(false);

    useEffect(() => {
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
    }, []);

    // Handlers for Attendance Approval
    const handleAttSearch = () => {
        console.log("Search Attendance Approval:", { attKeyword, attTeam });
        // Add API call logic here when ready
    };

    const handleAttClear = () => {
        setAttKeyword('');
        setAttTeam(undefined);
        console.log("Clear Attendance Approval");
        // Add clear logic/refetch here when ready
    };

    // Handlers for Leave Approval
    const fetchLeaveApproval = async (clear = false) => {
        setLoading(true);
        try {
            const payload = {
                Search: clear ? null : (leaveKeyword || null),
                Team: clear ? null : (leaveTeam || null)
            };

            const cleanPayload = Object.fromEntries(
                Object.entries(payload).filter(([_, v]) => v != null && v !== "")
            );

            const response = await getLeaveApproval.get_leave_approval(cleanPayload);
            if (response.data) {
                const formattedData = response.data.map((item, index) => {
                    let durationDisplay = '-';
                    if (item.total_minute) {
                        let minutes = item.total_minute;
                        let days = Math.floor(minutes / 510);
                        minutes %= 510;
                        let hours = Math.floor(minutes / 60);
                        let mins = minutes % 60;

                        let parts = [];
                        if (days > 0) parts.push(`${days} วัน`);
                        if (hours > 0) parts.push(`${hours} ชั่วโมง`);
                        if (mins > 0) parts.push(`${mins} นาที`);

                        durationDisplay = parts.length > 0 ? parts.join(', ') : '0 นาที';
                    }

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
            setLeaveApprovalData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveApproval();
    }, []);

    const handleLeaveSearch = () => {
        fetchLeaveApproval();
    };

    const handleLeaveClear = () => {
        setLeaveKeyword('');
        setLeaveTeam(undefined);
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

            const response = await getLeaveApproval.post_leave_approval(payload);
            if (response.data && response.data.message === "Success") {
                noticeShowMessage("ทำรายการสำเร็จ");
                setIsLeaveDetailModalOpen(false);
                fetchLeaveApproval();
            }
        } catch (error) {
            console.error(`Error ${action} leave approval:`, error);
            if (error.response && error.response.data && error.response.data.message) {
                noticeShowMessage("error", error.response.data.message);
            } else {
                noticeShowMessage("error", `เกิดข้อผิดพลาดในการทำรายการ`);
            }
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
            render: (text) => {
                if (!text) return "-";
                // Assuming date format is YYYY-MM-DD or similar, format to DD/MM/YYYY
                // Note: Actual implementation depends on incoming data format.
                // For now reusing logic from AttendanceLeaveMange if applicable or simple render
                return text;
            }
        },
        {
            title: 'วันที่',
            dataIndex: 'attDate',
            key: 'attDate',
            align: 'center',
            width: 100,
            render: (text) => {
                if (!text) return "-";
                // Assuming date format is YYYY-MM-DD or similar, format to DD/MM/YYYY
                // Note: Actual implementation depends on incoming data format.
                // For now reusing logic from AttendanceLeaveMange if applicable or simple render
                return text;
            }
        },
        {
            title: 'OA User',
            dataIndex: 'oa_user',
            key: 'oa_user',
            align: 'left',
            width: 100,
        },
        {
            title: 'ชื่อ-นามสกุล',
            dataIndex: 'fullname',
            key: 'fullname',
            align: 'left',
            width: 150,
        },
        {
            title: 'Team',
            dataIndex: 'team',
            key: 'team',
            align: 'center',
            width: 100,
        },
        {
            title: 'เหตุผลคำขอ',
            dataIndex: 'requestReason',
            key: 'requestReason',
            align: 'left',
            width: 150,
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
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 100,
            render: (text) => {
                // Placeholder for status tags
                return text || "-";
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
            width: 50,
        },
        {
            title: 'ชื่อ-นามสกุล',
            dataIndex: 'fullname',
            key: 'fullname',
            align: 'left',
            width: 160,
        },
        {
            title: 'Team',
            dataIndex: 'team',
            key: 'team',
            align: 'center',
            width: 120,
        },
        {
            title: 'ประเภทการลา',
            dataIndex: 'leaveType',
            key: 'leaveType',
            align: 'center',
            width: 140,
        },
        {
            title: 'วันที่เริ่มต้น',
            dataIndex: 'startDate',
            key: 'startDate',
            align: 'center',
            width: 90,
        },
        {
            title: 'วันที่สิ้นสุด',
            dataIndex: 'endDate',
            key: 'endDate',
            align: 'center',
            width: 90,
        },
        {
            title: 'ระยะเวลา',
            dataIndex: 'duration',
            key: 'duration',
            align: 'center',
            width: 100,
        },
        {
            title: 'ช่วงเวลา',
            dataIndex: 'period',
            key: 'period',
            align: 'center',
            width: 120,
        },
        {
            title: 'เหตุผล',
            dataIndex: 'reason',
            key: 'reason',
            align: 'left',
            width: 150,
            render: (text) => (
                <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                    {text && text.trim() ? text : "-"}
                </div>
            ),
        },
        {
            title: 'เหตุผลที่ถูกปฏิเสธ',
            dataIndex: 'reject_reason',
            key: 'reject_reason',
            align: 'center',
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
            width: 120,
            render: (text) => {
                const statusLabel = text ? String(text).trim() : "-";
                if (statusLabel === "Pending Approval" || statusLabel === "Pending") return <PendingApproveTag />;
                if (statusLabel === "Approved") return <ApproveTag />;
                if (statusLabel === "Rejected") return <RejectTag />;
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
                                style={{ width: 250 }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Form component={false}>
                                <Form.Item label={<span style={{ fontWeight: 700, fontSize: '16px' }}>Team</span>} style={{ marginBottom: 0 }}>
                                    <Select
                                        placeholder="ทั้งหมด"
                                        value={attTeam}
                                        onChange={(value) => setAttTeam(value)}
                                        style={{ width: 180 }}
                                        allowClear
                                    >
                                        <Option value={null}>ทั้งหมด</Option>
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

                    <div style={{ marginTop: "15px" }}>
                        <TableUI
                            columns={attApprovalColumns}
                            dataSource={[]} // Empty data for now
                            pagination={true}
                            bordered={true}
                            size="large"
                            rowSelection={undefined}
                            rowKey={(record, index) => index}
                        />
                    </div>

                </Card.Body>
            </Card>

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
                                style={{ width: 250 }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Form component={false}>
                                <Form.Item label={<span style={{ fontWeight: 700, fontSize: '16px' }}>Team</span>} style={{ marginBottom: 0 }}>
                                    <Select
                                        placeholder="ทั้งหมด"
                                        value={leaveTeam}
                                        onChange={(value) => setLeaveTeam(value)}
                                        style={{ width: 180 }}
                                        allowClear
                                    >
                                        <Option value={null}>ทั้งหมด</Option>
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

                    <div style={{ marginTop: "15px" }}>
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

                </Card.Body>
            </Card>

            <Modal
                title={
                    <div style={{ backgroundColor: '#2750B0', color: 'white', padding: '16px 24px', margin: '-20px -24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '18px', fontWeight: '600', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                        <span>Leave Detail</span>
                        <i className="bi bi-x-lg" onClick={() => setIsLeaveDetailModalOpen(false)} style={{ cursor: "pointer", fontSize: "20px" }}></i>
                    </div>
                }
                open={isLeaveDetailModalOpen}
                onCancel={() => setIsLeaveDetailModalOpen(false)}
                closable={false}
                width={700}
                centered
                styles={{ header: { padding: 0, borderBottom: 'none' }, body: { padding: '24px' }, content: { padding: 0, overflow: 'hidden', borderRadius: '8px' }, mask: { backgroundColor: 'rgba(0, 0, 0, 0.5)' } }}
                footer={[
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', paddingBottom: '20px' }} key="footer">
                        <ButtonBootstrap onClick={() => handleLeaveApprovalAction('Approve')} style={{ backgroundColor: '#BCD0FF', borderColor: '#000', color: 'black', fontWeight: 'bold', borderRadius: '8px', height: '40px', minWidth: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <i className="bi bi-file-earmark-check-fill" style={{ fontSize: '1.2em' }}></i> Approve
                        </ButtonBootstrap>
                        <ButtonBootstrap onClick={() => handleLeaveApprovalAction('Reject')} style={{ backgroundColor: '#FFBCBC', borderColor: '#000', color: 'black', fontWeight: 'bold', borderRadius: '8px', height: '40px', minWidth: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <i className="bi bi-list-task" style={{ fontSize: '1.2em', position: 'relative' }}>
                                <i className="bi bi-x" style={{ position: 'absolute', bottom: '-4px', right: '-6px', fontSize: '14px', WebkitTextStroke: '1px black' }}></i>
                            </i> Reject
                        </ButtonBootstrap>
                        <ButtonBootstrap onClick={() => setIsLeaveDetailModalOpen(false)} style={{ backgroundColor: '#e9ecef', borderColor: '#000', color: 'black', fontWeight: 'bold', borderRadius: '8px', height: '40px', minWidth: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <i className="bi bi-x-lg" style={{ fontSize: '1.2em' }}></i> Close
                        </ButtonBootstrap>
                    </div>
                ]}
            >
                {selectedLeave && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '15px' }}>
                        {/* ข้อมูลลา */}
                        <div style={{ border: '2px solid black', borderRadius: '8px', padding: '15px', position: 'relative', marginTop: '10px' }}>
                            <span style={{ position: 'absolute', top: '-12px', left: '15px', backgroundColor: 'white', padding: '0 5px', fontWeight: 'bold' }}>ข้อมูลลา</span>
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
                        </div>

                        {/* เหตุผลที่ร้องขอ */}
                        <div style={{ border: '2px solid black', borderRadius: '8px', padding: '15px', position: 'relative', marginTop: '10px' }}>
                            <span style={{ position: 'absolute', top: '-12px', left: '15px', backgroundColor: 'white', padding: '0 5px', fontWeight: 'bold' }}>เหตุผลที่ร้องขอ</span>
                            <div>{selectedLeave.reason || '-'}</div>
                        </div>

                        {/* เหตุผลที่ Reject */}
                        <div style={{ border: rejectReasonError ? '2px solid red' : '2px solid black', borderRadius: '8px', padding: '15px', position: 'relative', marginTop: '10px' }}>
                            <span style={{ position: 'absolute', top: '-12px', left: '15px', backgroundColor: 'white', padding: '0 5px', fontWeight: 'bold', color: rejectReasonError ? 'red' : 'black' }}>เหตุผลที่ Reject</span>
                            <Input
                                placeholder="กรอก เหตุผลที่ Reject"
                                value={rejectReasonInput}
                                onChange={(e) => {
                                    setRejectReasonInput(e.target.value);
                                    if (e.target.value.trim() !== '') setRejectReasonError('');
                                }}
                                style={{ border: rejectReasonError ? '1px solid red' : '1px solid black', borderRadius: '4px', height: '40px' }}
                            />
                            {rejectReasonError && <div style={{ color: 'red', marginTop: '5px', fontSize: '13px' }}>{rejectReasonError}</div>}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AttendanceApproval;
