import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
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

const { Option } = Select;

const AttendanceApproval = () => {
    // Dropdown Data
    const [teamList, setTeamList] = useState([]);

    // Attendance Approval Search State
    const [attKeyword, setAttKeyword] = useState('');
    const [attTeam, setAttTeam] = useState(undefined);
    const [attApprovalData, setAttApprovalData] = useState([]);

    // Leave Approval Search State
    const [leaveKeyword, setLeaveKeyword] = useState('');
    const [leaveTeam, setLeaveTeam] = useState(undefined);

    const [loading, setLoading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [modalLoading, setModalLoading] = useState(false);

    const fetchAttApprovalData = async (keyword = '', team = undefined) => {
        setLoading(true);
        try {
            const payload = {
                Name: keyword || undefined,
                Team: team || undefined
            };
            const response = await getAttApproval.get_att_approval(payload);
            if (response && response.data) {
                setAttApprovalData(response.data);
            } else {
                setAttApprovalData([]);
            }
        } catch (error) {
            console.error("Error fetching attendance approval data:", error);
            noticeShowMessage("เกิดข้อผิดพลาดในการดึงข้อมูล Attendance Approval", true);
            setAttApprovalData([]);
        } finally {
            setLoading(false);
        }
    };

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
        fetchAttApprovalData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handlers for Attendance Approval
    const handleAttSearch = () => {
        console.log("Search Attendance Approval:", { attKeyword, attTeam });
        fetchAttApprovalData(attKeyword, attTeam);
    };

    const handleAttClear = () => {
        setAttKeyword('');
        setAttTeam(undefined);
        console.log("Clear Attendance Approval");
        fetchAttApprovalData('', undefined);
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
            noticeShowMessage("เกิดข้อผิดพลาดในการดึงข้อมูลรายละเอียด", true);
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalData(null);
        setSelectedRecord(null);
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
            noticeShowMessage("กรุณาระบุเหตุผลที่ Reject", true);
            return;
        }

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
                noticeShowMessage(isApprove ? "Approve สำเร็จ" : "Reject สำเร็จ", false);
                handleCloseModal();
                fetchAttApprovalData(attKeyword, attTeam);
            } else {
                noticeShowMessage(res?.message || (isApprove ? "เกิดข้อผิดพลาดในการ Approve" : "เกิดข้อผิดพลาดในการ Reject"), true);
            }
        } catch (error) {
            console.error("Error submit approval:", error);
            noticeShowMessage("เกิดข้อผิดพลาดจากระบบ", true);
        } finally {
            setModalLoading(false);
        }
    };

    const handleApprove = () => handleSubmit(true);
    const handleReject = () => handleSubmit(false);

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
            width: 100,
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
            width: 100,
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
                    width: 80,
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
                    width: 120,
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
                    width: 80,
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
                    width: 120,
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
            width: 100,
            render: (text) => {
                const status = text ? text.trim() : "";
                if (status === "PA") return <PendingApproveTag />;
                if (status === "AP") return <ApproveTag />;
                if (status === "RJ") return <RejectTag />;
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
                            dataSource={attApprovalData}
                            pagination={true}
                            bordered={true}
                            size="small"
                            rowSelection={undefined}
                            rowKey={(record, index) => record.id || index}
                        />
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
                    <div style={{ marginTop: '10px' }}>
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
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={2}
                                style={{ resize: 'none' }}
                            />
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
