import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { Input, DatePicker, Select, Form } from 'antd';
import { SearchToolBtnBootstrap, ClearToolBtnBootstrap, AddToolBtnBootstrap, EditToolBtnBootstrap, DeleteToolBtn } from '../../Utilities/Buttons/Buttons';
import { RejectTag, ApproveTag, PendingApproveTag } from "../../Utilities/StatusTag/StatusTag";
import { getAttChange } from '../../../services/att-change.service';
import TableUI from '../../Utilities/Table/TableUI';
import { getDropdown } from '../../../services/dropdown.service';
import { noticeShowMessage } from '../../Utilities/Notification';
import Loading from "../../Utilities/Loading";

const { Option } = Select;

const AttendanceLeaveMange = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [status, setStatus] = useState();
    const [statusList, setStatusList] = useState([]);
    const [attChangeData, setAttChangeData] = useState([]);
    const [originalData, setOriginalData] = useState([]); // Store original data for client-side filtering
    const [keyword, setKeyword] = useState(""); // Add keyword state
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const dropdownResponse = await getDropdown.get_dropdown({ type: 'AttendanceChangeStatus' });
                if (dropdownResponse.data) {
                    setStatusList(dropdownResponse.data);
                }

                const attChangeResponse = await getAttChange.get_att_change();
                if (attChangeResponse.data) {
                    setAttChangeData(attChangeResponse.data);
                    setOriginalData(attChangeResponse.data); // Keep original data
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSearch = async () => {
        if (endDate && !startDate) {
            noticeShowMessage("กรุณากรอกวันที่เริ่มต้น",true);
            return;
        }

        setLoading(true);
        try {
            const payload = {
                startDate: startDate ? startDate.format("YYYY/MM/DD") : null,
                endDate: endDate ? endDate.format("YYYY/MM/DD") : null,
                dropdown: status === "ทั้งหมด" ? null : status
            };

            const response = await getAttChange.get_att_change(payload);
            if (response.data) {
                setAttChangeData(response.data);
            }
        } catch (error) {
            console.error("Error searching attendance change:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setStartDate(null);
        setEndDate(null);
        setStatus("ทั้งหมด");
        setKeyword("");
        setAttChangeData(originalData);
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
                    case 'AP':
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
                    {/* Placeholder for action button */}
                    <button className="btn btn-warning btn-sm"><i className="bi bi-pencil-square"></i></button>
                    <button className="btn btn-danger btn-sm ms-2"><i className="bi bi-trash"></i></button>
                </div>
            ),
            width: 120,
            align: 'center'
        },
        {
            title: 'ประเภทวันลา',
            dataIndex: 'leaveType',
            key: 'leaveType',
            align: 'center',
            width: 150
        },
        {
            title: 'สถานะ',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 120
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
            width: 100
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
        <div style={{ paddingLeft: '20px', paddingRight: '20px', backgroundColor: '#e9ecef', minHeight: '80vh' }}>
            {loading && <Loading />}
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
                                    value={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    style={{ width: 140 }}
                                />
                                <span>-</span>
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    placeholder="DD/MM/YYYY"
                                    inputReadOnly={true}
                                    value={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    style={{ width: 140 }}


                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Form component={false}>
                                <Form.Item label={<span style={{ fontWeight: 700, fontSize: '16px' }}>สถานะคำขอ:</span>} style={{ marginBottom: 0 }}>
                                    <Select
                                        placeholder="-เลือก-"
                                        value={status}
                                        onChange={(value) => setStatus(value)}
                                        style={{ width: 150 }}
                                    >
                                        {statusList.map((item) => (
                                            <Option key={item.value} value={item.value}>{item.label}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Form>
                        </div>

                        <div style={{ marginLeft: "auto", display: 'flex', gap: '10px', alignItems: 'center' }}>

                            <SearchToolBtnBootstrap onClick={handleSearch} />
                            <ClearToolBtnBootstrap onClick={handleClear} />
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
                                    value={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    style={{ width: 140 }}
                                />
                                <span>-</span>
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    placeholder="DD/MM/YYYY"
                                    inputReadOnly={true}
                                    value={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    style={{ width: 140 }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Form component={false}>
                                <Form.Item label={<span style={{ fontWeight: 700, fontSize: '16px' }}>สถานะคำขอ:</span>} style={{ marginBottom: 0 }}>
                                    <Select
                                        placeholder="-เลือก-"
                                        value={status}
                                        onChange={(value) => setStatus(value)}
                                        style={{ width: 150 }}
                                    >
                                        {statusList.map((item) => (
                                            <Option key={item.value} value={item.value}>{item.label}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Form>
                        </div>

                        <div style={{ marginLeft: "auto", display: 'flex', gap: '10px' }}>
                            <SearchToolBtnBootstrap onClick={handleSearch} />
                            <ClearToolBtnBootstrap onClick={handleClear} />
                        </div>
                    </div>
                    <div style={{ marginTop: "5px" }}>
                        <TableUI
                            columns={leaveColumns}
                            dataSource={[]}
                            pagination={false}
                            bordered={true}
                            size="small"
                        />
                    </div>
                </Card.Body>


            </Card>
        </div>
    );
};

export default AttendanceLeaveMange;