import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { DatePicker, Select, Form, Tag } from 'antd';
import { SearchToolBtnBootstrap, ClearToolBtnBootstrap, AddToolBtnBootstrap } from '../../Utilities/Buttons/Buttons';
import TableUI from '../../Utilities/Table/TableUI';
import { getDropdown } from '../../../services/dropdown.service';
import { getLeave } from '../../../services/leave.service';
import TokenService from '../../../services/token.service';
import moment from 'moment';

const { Option } = Select;

const AttendanceLeaveMange = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [status, setStatus] = useState();
    const [statusList, setStatusList] = useState([]);
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDropdown = async () => {
            try {
                const response = await getDropdown.get_dropdown({ type: 'AttendanceChangeStatus' });
                if (response.data) {
                    setStatusList(response.data);
                }
            } catch (error) {
                console.error("Error fetching dropdown:", error);
            }
        };

        fetchDropdown();
        fetchLeaveData();
    }, []);

    const fetchLeaveData = async (searchParams = {}) => {
        setLoading(true);
        try {
            const user = TokenService.getUser();
            const username = user?.profile?.oa_user;
            if (username) {
                const payload = {
                    username: username,
                    startDate: searchParams.startDate ? searchParams.startDate : null,
                    endDate: searchParams.endDate ? searchParams.endDate : null,
                    status: searchParams.status
                };

                // Debug log to check incoming params
                console.log("fetchLeaveData payload:", payload);

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
                    setLeaveHistory([]); // Clear table if no data
                }
            }
        } catch (error) {
            console.error("Error fetching leave data:", error);
            setLeaveHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        const searchParams = {
            startDate: startDate ? startDate.format("YYYY-MM-DD") : null,
            endDate: endDate ? endDate.format("YYYY-MM-DD") : null,
            status: status && status !== "ทั้งหมด" ? status : null
        };
        console.log("handleSearch params:", searchParams);
        fetchLeaveData(searchParams);
    };

    const handleClear = () => {
        setStartDate(null);
        setEndDate(null);
        setStatus("ทั้งหมด");
        fetchLeaveData();
    };

    const attColumns = [
        {
            title: '',
            key: 'action',
            render: (text, record) => (
                <div style={{ textAlign: 'center' }}>
                    {/* Placeholder for action button */}
                    <button className="btn btn-warning btn-sm"><i className="bi bi-pencil-square"></i></button>
                </div>
            ),
            width: 50,
            align: 'center'
        },
        {
            title: 'วันที่',
            dataIndex: 'date',
            key: 'date',
            align: 'center',
            width: 100
        },
        {
            title: 'สถานะคำขอ',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 120
        },
        {
            title: 'เหตุผลคำขอ',
            dataIndex: 'requestReason',
            key: 'requestReason',
            width: 150
        },
        {
            title: 'Check-In',
            children: [
                {
                    title: 'เวลา (น.)',
                    dataIndex: 'checkInTime',
                    key: 'checkInTime',
                    align: 'center',
                    width: 80
                },
                {
                    title: 'ตำแหน่ง',
                    dataIndex: 'checkInLocation',
                    key: 'checkInLocation',
                    width: 120
                },
                {
                    title: 'เหตุผล',
                    dataIndex: 'checkInReason',
                    key: 'checkInReason',
                    width: 120
                },
                {
                    title: 'เวลาที่ขอแก้ไข (น.)',
                    dataIndex: 'checkInEditTime',
                    key: 'checkInEditTime',
                    align: 'center',
                    width: 120
                },
                {
                    title: 'ตำแหน่งที่ขอแก้ไข',
                    dataIndex: 'checkInEditLocation',
                    key: 'checkInEditLocation',
                    width: 120
                }
            ]
        },
        {
            title: 'Check-Out',
            children: [
                {
                    title: 'เวลา (น.)',
                    dataIndex: 'checkOutTime',
                    key: 'checkOutTime',
                    align: 'center',
                    width: 80
                },
                {
                    title: 'ตำแหน่ง',
                    dataIndex: 'checkOutLocation',
                    key: 'checkOutLocation',
                    width: 120
                },
                {
                    title: 'เหตุผล',
                    dataIndex: 'checkOutReason',
                    key: 'checkOutReason',
                    width: 120
                },
                {
                    title: 'เวลาที่ขอแก้ไข (น.)',
                    dataIndex: 'checkOutEditTime',
                    key: 'checkOutEditTime',
                    align: 'center',
                    width: 120
                },
                {
                    title: 'ตำแหน่งที่ขอแก้ไข',
                    dataIndex: 'checkOutEditLocation',
                    key: 'checkOutEditLocation',
                    width: 120
                }
            ]
        }
    ];

    const leaveColumns = [
        {
            title: (
                <div style={{ textAlign: 'center' }}>
                    <button
                        className="btn btn-success btn-sm"
                        style={{ fontWeight: 'bold' }}
                        onClick={() => console.log("Add Leave Request")}
                    >
                        + Add
                    </button>
                </div>
            ),
            key: 'action',
            render: (text, record) => (
                <div style={{ textAlign: 'center' }}>
                    {/* Logic to show Edit or Delete could go here, for now showing styled Edit */}
                    <button className="btn btn-warning btn-sm" style={{ fontWeight: 'bold', color: '#000' }}>
                        <i className="bi bi-pencil-square me-1"></i> Edit
                    </button>
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
            width: 150,
            render: (status) => {
                let color = '#d9d9d9'; // Default gray
                let textColor = 'white';

                // Map status to colors based on screenshot
                // Reject -> Red
                // Approve -> Green
                // Pending Approve -> Yellow/Orange

                const statusLower = status ? status.toLowerCase() : '';

                if (statusLower.includes('approve') && !statusLower.includes('pending')) {
                    color = '#28a745'; // Green
                } else if (statusLower.includes('reject')) {
                    color = '#dc3545'; // Red
                } else if (statusLower.includes('pending')) {
                    color = '#ffc107'; // Yellow/Orange
                    textColor = 'black'; // Black text for yellow background
                }

                return (
                    <div style={{
                        backgroundColor: color,
                        color: textColor,
                        borderRadius: '15px',
                        padding: '4px 12px',
                        display: 'inline-block',
                        fontWeight: 'bold',
                        minWidth: '100px'
                    }}>
                        {status || '-'}
                    </div>
                );
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

                        <div style={{ marginLeft: "auto", display: 'flex', gap: '10px' }}>
                            <SearchToolBtnBootstrap onClick={handleSearch} />
                            <ClearToolBtnBootstrap onClick={handleClear} />
                        </div>
                    </div>
                    <div style={{ marginTop: "5px" }}>
                        <TableUI
                            columns={attColumns}
                            dataSource={[]}
                            pagination={false}
                            bordered={true}
                            size="small"
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