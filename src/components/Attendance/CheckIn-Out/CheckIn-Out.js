import React, { useEffect, useState } from "react";
import { Card, Row, Col } from 'react-bootstrap';
import { CheckOutlined } from '@ant-design/icons';
import { ResetLocationBtn, CheckInBtn, CheckOutBtn } from "../../Utilities/Buttons/Buttons";
import TableUI from "../../Utilities/Table/TableUI";

const CheckInOut = () => {

    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [coordinates, setCoordinates] = useState({ lat: null, long: null });

    useEffect(() => {

        // Update time every second
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        // Get Geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoordinates({
                        lat: position.coords.latitude,
                        long: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error getting location: ", error);
                    // Handle error if needed
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }

        return () => clearInterval(timer);
    }, []);

    const formatDate = (date) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        let dateString = date.toLocaleDateString('th-TH', options);
        const months = [
            "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
            "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
        ];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear(); // This is CE year (e.g., 2025)
        return `วันที่ ${day} ${month} ${year}`;
    };

    const formatTime = (date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `เวลา ${hours}:${minutes} น.`;
    };

    const handleResetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoordinates({
                        lat: position.coords.latitude,
                        long: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error getting location: ", error);
                }
            );
        }
    };

    const handleCheckIn = () => {
        // Functionality to be implemented
        console.log("Check-In Clicked");
    };

    const handleCheckOut = () => {
        // Functionality to be implemented
        console.log("Check-Out Clicked");
    };

    const columns = [
        {
            title: 'วันที่',
            dataIndex: 'date',
            key: 'date',
            align: 'center',
            width: 150,
            SortName: 'date',
        },
        {
            title: 'Check-In',
            children: [
                {
                    title: 'เวลา (น.)',
                    dataIndex: 'checkin_time',
                    key: 'checkin_time',
                    align: 'center',
                    width: 100,
                    sorter: (a, b) => String(a.checkin_time ?? "").localeCompare(String(b.checkin_time ?? "")),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                },
                {
                    title: 'สถานะเวลา',
                    dataIndex: 'checkin_time_status',
                    key: 'checkin_time_status',
                    align: 'center',
                    width: 120,
                    sorter: (a, b) => String(a.checkin_time_status ?? "").localeCompare(String(b.checkin_time_status ?? "")),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                },
                {
                    title: 'ตำแหน่ง',
                    dataIndex: 'checkin_location',
                    key: 'checkin_location',
                    align: 'center',
                    width: 200,
                    sorter: (a, b) => String(a.checkin_location ?? "").localeCompare(String(b.checkin_location ?? "")),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                },
                {
                    title: 'สถานะตำแหน่ง',
                    dataIndex: 'checkin_location_status',
                    key: 'checkin_location_status',
                    align: 'center',
                    width: 150,
                    sorter: (a, b) => String(a.checkin_location_status ?? "").localeCompare(String(b.checkin_location_status ?? "")),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                },
                {
                    title: 'เหตุผล',
                    dataIndex: 'checkin_reason',
                    key: 'checkin_reason',
                    align: 'center',
                    width: 150,
                    sorter: (a, b) => String(a.checkin_reason ?? "").localeCompare(String(b.checkin_reason ?? "")),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                },
            ]
        },
        {
            title: 'Check-Out',
            children: [
                {
                    title: 'เวลา (น.)',
                    dataIndex: 'checkout_time',
                    key: 'checkout_time',
                    align: 'center',
                    width: 100,
                    sorter: (a, b) => String(a.checkout_time ?? "").localeCompare(String(b.checkout_time ?? "")),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                },
                {
                    title: 'สถานะเวลา',
                    dataIndex: 'checkout_time_status',
                    key: 'checkout_time_status',
                    align: 'center',
                    width: 120,
                    sorter: (a, b) => String(a.checkout_time_status ?? "").localeCompare(String(b.checkout_time_status ?? "")),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                },
                {
                    title: 'ตำแหน่ง',
                    dataIndex: 'checkout_location',
                    key: 'checkout_location',
                    align: 'center',
                    width: 200,
                    sorter: (a, b) => String(a.checkout_location ?? "").localeCompare(String(b.checkout_location ?? "")),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                },
                {
                    title: 'สถานะตำแหน่ง',
                    dataIndex: 'checkout_location_status',
                    key: 'checkout_location_status',
                    align: 'center',
                    width: 150,
                    sorter: (a, b) => String(a.checkout_location_status ?? "").localeCompare(String(b.checkout_location_status ?? "")),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                },
                {
                    title: 'เหตุผล',
                    dataIndex: 'checkout_reason',
                    key: 'checkout_reason',
                    align: 'center',
                    width: 150,
                    sorter: (a, b) => String(a.checkout_reason ?? "").localeCompare(String(b.checkout_reason ?? "")),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                },
            ]
        }
    ];

    const mockData = [
  {
    key: 0,
    date: "01/12/2025",
    checkin_time: "08:25",
    checkin_time_status: "ตรงเวลา",
    checkin_location: "พระราม 3",
    checkin_location_status: "ในพื้นที่",
    checkin_reason: "-",
    checkout_time: "17:25",
    checkout_time_status: "ตรงเวลา",
    checkout_location: "พระราม 3",
    checkout_location_status: "ในพื้นที่",
    checkout_reason: "-"
  },
  {
    key: 1,
    date: "01/12/2025",
    checkin_time: "08:42",
    checkin_time_status: "เกินเวลา",
    checkin_location: "สอน",
    checkin_location_status: "นอกพื้นที่",
    checkin_reason: "รถติดครับ",
    checkout_time: "17:42",
    checkout_time_status: "ตรงเวลา",
    checkout_location: "พระราม 3",
    checkout_location_status: "นอกพื้นที่",
    checkout_reason: "-"
  },
  {
    key: 2,
    date: "02/12/2025",
    checkin_time: "08:30",
    checkin_time_status: "ตรงเวลา",
    checkin_location: "พระราม 3",
    checkin_location_status: "ในพื้นที่",
    checkin_reason: "-",
    checkout_time: "17:30",
    checkout_time_status: "ตรงเวลา",
    checkout_location: "พระราม 3",
    checkout_location_status: "ในพื้นที่",
    checkout_reason: "-"
  },
  {
    key: 3,
    date: "02/12/2025",
    checkin_time: "08:55",
    checkin_time_status: "ตรงเวลา",
    checkin_location: "พระราม 3",
    checkin_location_status: "ในพื้นที่",
    checkin_reason: "-",
    checkout_time: "17:55",
    checkout_time_status: "ตรงเวลา",
    checkout_location: "พระราม 3",
    checkout_location_status: "ในพื้นที่",
    checkout_reason: "-"
  },
  {
    key: 4,
    date: "03/12/2025",
    checkin_time: "08:18",
    checkin_time_status: "ตรงเวลา",
    checkin_location: "พระราม 3",
    checkin_location_status: "ในพื้นที่",
    checkin_reason: "-",
    checkout_time: "17:18",
    checkout_time_status: "ตรงเวลา",
    checkout_location: "สอน",
    checkout_location_status: "นอกพื้นที่",
    checkout_reason: "ประชุมที่สอนครับ"
  },
  {
    key: 5,
    date: "03/12/2025",
    checkin_time: "08:33",
    checkin_time_status: "ตรงเวลา",
    checkin_location: "พระราม 3",
    checkin_location_status: "ในพื้นที่",
    checkin_reason: "-",
    checkout_time: "17:33",
    checkout_time_status: "ตรงเวลา",
    checkout_location: "พระราม 3",
    checkout_location_status: "ในพื้นที่",
    checkout_reason: "-"
  },
  {
    key: 6,
    date: "04/12/2025",
    checkin_time: "08:48",
    checkin_time_status: "ตรงเวลา",
    checkin_location: "พระราม 3",
    checkin_location_status: "ในพื้นที่",
    checkin_reason: "-",
    checkout_time: "17:48",
    checkout_time_status: "ตรงเวลา",
    checkout_location: "พระราม 3",
    checkout_location_status: "ในพื้นที่",
    checkout_reason: "-"
  }
];


    return (
        <div style={{ paddingLeft: '20px', paddingRight: '20px', backgroundColor: '#e9ecef', minHeight: '80vh' }}>

            {/* Main Card */}
            <Card
                className="shadow-sm border-0 p-3 "
                style={{
                    borderRadius: "6px",
                    overflow: "hidden",
                    boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
                }}
            >
                <Card
                    style={{ backgroundColor: "#F8F8F8" }}
                    className="rounded-4">

                    <Card.Body style={{ padding: "30px" }}
                        className="border border-3 border-black  rounded-4" >
                        <Row>
                            {/* Left Column: Details */}
                            <Col md={6}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {/* Date */}
                                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                        {formatDate(currentDateTime)}
                                    </div>
                                    {/* Time */}
                                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                        {formatTime(currentDateTime)}
                                    </div>
                                    {/* Location Name */}
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span>ธนาคารกรุงเทพ สำนักงานพระราม 3</span>
                                        <CheckOutlined style={{ color: 'green', fontSize: '20px' }} />
                                    </div>
                                    {/* Coordinates */}
                                    <div style={{ fontSize: '20px', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span>
                                            {coordinates.lat !== null ? coordinates.lat.toFixed(7) : "Loading..."}
                                            ,
                                            {coordinates.long !== null ? coordinates.long.toFixed(7) : "Loading..."}
                                        </span>
                                        <CheckOutlined style={{ color: 'green', fontSize: '20px' }} />
                                    </div>

                                    {/* Reset Location Button */}
                                    <div style={{ marginTop: '20px' }}>
                                        <ResetLocationBtn onClick={handleResetLocation} />
                                    </div>
                                </div>
                            </Col>

                            {/* Right Column: Map Placeholder */}
                            <Col md={6}>
                                <div
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        backgroundColor: "#e0e0e0", // Grey placeholder
                                        borderRadius: "10px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        overflow: "hidden"
                                    }}
                                >
                                    {/* Placeholder Image or Text - replicating the map look simplistically */}
                                    <div style={{ color: "#757575", textAlign: "center" }}>
                                        <i className="bi bi-geo-alt-fill" style={{ fontSize: "40px", color: "#db4437" }}></i>
                                        <p>Map Placeholder</p>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>


                </Card>

                {/* Action Buttons */}
                <div style={{ display: "flex", justifyContent: "center", gap: "40px", marginTop: "30px" }}>
                    <CheckInBtn onClick={handleCheckIn} />
                    <CheckOutBtn onClick={handleCheckOut} />
                </div>

                <div style={{ marginTop: "5px", fontWeight: "normal", fontSize: "22px", color: "#000000ff" }}>
                    Attendance History
                </div>

                <div style={{ marginTop: "5px" }}>
                    <TableUI
                        columns={columns}
                        dataSource={mockData || []}
                        pagination={false}
                        bordered={true}
                        size="large"
                    />
                </div>

            </Card>

        </div>
    );
};

export default CheckInOut;
