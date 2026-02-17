import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { DatePicker, Select, Form } from 'antd';
import { SearchToolBtnBootstrap, ClearToolBtnBootstrap, AddToolBtnBootstrap } from '../../Utilities/Buttons/Buttons';
import TableUI from '../../Utilities/Table/TableUI';
import { getDropdown } from '../../../services/dropdown.service';

const { Option } = Select;

const AttendanceLeaveMange = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [status, setStatus] = useState();
    const [statusList, setStatusList] = useState([]);

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
    }, []);

    const handleSearch = () => {
        console.log("Search:", { startDate, endDate, status });
    };

    const handleClear = () => {
        setStartDate(null);
        setEndDate(null);
        setStatus("ทั้งหมด");
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