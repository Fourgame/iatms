import { useState } from 'react';
import { Card } from 'react-bootstrap';
import { DatePicker, Select } from 'antd';
import { SearchToolBtnBootstrap, ClearToolBtnBootstrap } from '../../Utilities/Buttons/Buttons';

const { Option } = Select;

const AttendanceLeaveMange = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [status, setStatus] = useState("ทั้งหมด");

    const handleSearch = () => {
        console.log("Search:", { startDate, endDate, status });
    };

    const handleClear = () => {
        setStartDate(null);
        setEndDate(null);
        setStatus("ทั้งหมด");
    };

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
                    Search
                </Card.Header>
                <Card.Body className="p-0">
                    <div
                        style={{
                            padding: "12px 15px",
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
                                    value={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    style={{ width: 140 }}
                                />
                                <span>-</span>
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    placeholder="DD/MM/YYYY"
                                    value={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    style={{ width: 140 }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: 700, fontSize: '16px' }}>สถานะคำขอ:</span>
                            <Select
                                value={status}
                                onChange={(value) => setStatus(value)}
                                style={{ width: 150 }}
                            >
                                <Option value="ทั้งหมด">ทั้งหมด</Option>
                                <Option value="รออนุมัติ">รออนุมัติ</Option>
                                <Option value="อนุมัติ">อนุมัติ</Option>
                                <Option value="ไม่อนุมัติ">ไม่อนุมัติ</Option>
                            </Select>
                        </div>

                        <div style={{ marginLeft: "auto", display: 'flex', gap: '10px' }}>
                            <SearchToolBtnBootstrap onClick={handleSearch} />
                            <ClearToolBtnBootstrap onClick={handleClear} />
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default AttendanceLeaveMange;