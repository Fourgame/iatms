import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { DatePicker, Select, Form, Input } from 'antd';
import { SearchToolBtnBootstrap, ClearToolBtnBootstrap, AddToolBtnBootstrap, EditToolBtnBootstrap, DeleteToolBtn } from '../../Utilities/Buttons/Buttons';
import { RejectTag, ApproveTag, PendingApproveTag } from "../../Utilities/StatusTag/StatusTag";
import TokenService from '../../../services/token.service';
import TableUI from '../../Utilities/Table/TableUI';
import { getDropdown } from '../../../services/dropdown.service';
import { noticeShowMessage } from '../../Utilities/Notification';
import Loading from "../../Utilities/Loading";

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
    const handleLeaveSearch = () => {
        console.log("Search Leave Approval:", { leaveKeyword, leaveTeam });
        // Add API call logic here when ready
    };

    const handleLeaveClear = () => {
        setLeaveKeyword('');
        setLeaveTeam(undefined);
        console.log("Clear Leave Approval");
        // Add clear logic/refetch here when ready
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
            render: (text) => (
                <div style={{ textAlign: 'center' }}>
                    {/* Placeholder for action button from image */}
                    <span style={{ color: '#1890ff', cursor: 'pointer' }}>Approve/Reject</span>
                </div>
            )
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
            title: 'ประเภทการลา',
            dataIndex: 'leaveType',
            key: 'leaveType',
            align: 'center',
            width: 120,
        },
        {
            title: 'วันที่เริ่มต้น',
            dataIndex: 'startDate',
            key: 'startDate',
            align: 'center',
            width: 110,
        },
        {
            title: 'วันที่สิ้นสุด',
            dataIndex: 'endDate',
            key: 'endDate',
            align: 'center',
            width: 110,
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
            width: 100,
        },
        {
            title: 'เหตุผล',
            dataIndex: 'reason',
            key: 'reason',
            align: 'left',
            width: 150,
        },
        {
            title: 'สถานะ',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 120,
            render: (text) => {
                // Placeholder for status tags
                return text || "-";
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
        </div>
    );
};

export default AttendanceApproval;
