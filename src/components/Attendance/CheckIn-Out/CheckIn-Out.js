import React, { useEffect, useState, useMemo } from "react";
import { Card, Row, Col } from 'react-bootstrap';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { ResetLocationBtn, CheckInBtn, CheckOutBtn, SaveModalBtnBootstrap, CloseModalBtnBootstrap } from "../../Utilities/Buttons/Buttons";
import TableUI from "../../Utilities/Table/TableUI";
import { getButton, getCICO } from "../../../services/CICO.service";
import { GoogleMap, MarkerF, CircleF, useJsApiLoader } from "@react-google-maps/api";
import { Modal, Form, Input } from "antd";

const ReasonModal = ({ open, onClose, onSave, errorMessage }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            form.resetFields();
            setLoading(false);
        }
    }, [open, form]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            // Simulate saving or pass data back
            onSave(values.reason);
            setLoading(false);
        } catch (error) {
            console.log("Validation Failed:", error);
        }
    };

    return (
        <Modal
            title={
                <div style={{
                    backgroundColor: '#2750B0', // Match Listofvalues header color
                    color: 'white',
                    padding: '16px 24px',
                    margin: '-20px -24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '18px',
                    fontWeight: '600',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px'
                }}>
                    <span>ระบุเหตุผล</span>
                    <CloseOutlined onClick={onClose} style={{ cursor: "pointer", fontSize: "20px" }} />
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            width={600}
            centered
            closable={false} // Custom close icon in header
            styles={{
                header: { padding: 0, borderBottom: 'none' },
                body: { padding: '24px' },
                content: { padding: 0, overflow: 'hidden', borderRadius: '8px' }
            }}
        >
            <Form
                form={form}
                layout="vertical"
            >
                {/* Warning Message Box */}
                {errorMessage && (
                    <div style={{
                        backgroundColor: '#FFFBE6', // Light yellow
                        border: '1px solid #FFE58F',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '20px',
                        color: '#000',
                        fontWeight: '500',
                        fontSize: '16px'
                    }}>
                        <span style={{ fontWeight: 'bold' }}>Check-in</span> — {errorMessage}
                    </div>
                )}

                {/* Reason Textarea */}
                <Form.Item
                    name="reason"
                    label={<span style={{ fontWeight: "bold", fontSize: "16px" }}><span style={{ color: "red" }}>*</span>เหตุผล</span>}
                    rules={[{ required: true, message: 'กรุณากรอกเหตุผล' }]}
                >
                    <Input.TextArea
                        rows={5}
                        placeholder="กรอกเหตุผล"
                        style={{
                            borderRadius: '6px',
                            borderColor: '#000',
                            borderWidth: '2px', // Thicker border as per design
                            fontSize: '16px'
                        }}
                    />
                </Form.Item>

                {/* Footer Buttons */}
                <div className="d-flex justify-content-center gap-4 mt-4">
                    <SaveModalBtnBootstrap onClick={handleSave} loading={loading} />
                    <CloseModalBtnBootstrap onClick={onClose} />
                </div>
            </Form>
        </Modal>
    );
};


const CheckInOut = () => {

    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [coordinates, setCoordinates] = useState({ lat: null, long: null });
    const [buttonData, setButtonData] = useState(null); // Store full API response
    const [geofence, setGeofence] = useState(null);
    const [cicoHistory, setCicoHistory] = useState([]);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalError, setModalError] = useState("");
    const [actionType, setActionType] = useState(""); // "CheckIn" or "CheckOut"

    const DEFAULT_CENTER = useMemo(() => ({ lat: 13.7563, lng: 100.5018 }), []);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    });

    const mapCenter = useMemo(() => {
        return coordinates.lat !== null && coordinates.long !== null
            ? { lat: coordinates.lat, lng: coordinates.long }
            : DEFAULT_CENTER;
    }, [coordinates, DEFAULT_CENTER]);

    const mapOptions = useMemo(() => ({
        clickableIcons: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true, // Allow fullscreen
        zoomControl: true, // Allow zooming
        gestureHandling: 'cooperative' // Better handling on mobile/desktop
    }), []);

    // ทำ icon หมุดสีฟ้า (แนว “blue dot”)
    const blueDotSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <circle cx="12" cy="12" r="8" fill="#1a73e8" stroke="white" stroke-width="3"/>
  </svg>
`;
    const blueDotIconUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(blueDotSvg)}`;

    const mapContainerStyle = {
        width: "100%",
        height: "320px", // ปรับสูง-ต่ำได้ตามต้องการ
        borderRadius: "10px",
        overflow: "hidden",
    };


    useEffect(() => {
        const fetchButtonStatus = async () => {
            try {
                const response = await getButton.get_button();
                if (response.data) {
                    setButtonData(response.data);

                    if (response.data.wpCondition) {
                        // Example: " 13.690304143229888, 100.54908036008648, 100"
                        const parts = response.data.wpCondition.split(',').map(part => parseFloat(part.trim()));
                        if (parts.length === 3 && !parts.some(isNaN)) {
                            setGeofence({
                                lat: parts[0],
                                lng: parts[1],
                                radius: parts[2]
                            });
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching button status:", error);
            }
        };

        const fetchCICOData = async () => {
            try {
                // Assuming mode=7 based on context/screenshot, or fetch all
                const response = await getCICO.get_cico({ mode: 7 });
                if (response.data) {
                    // Map API data to table format if needed, or direct use if keys match
                    // Adding key for TableUI/Antd
                    const formattedData = response.data.map((item, index) => ({
                        ...item,
                        key: index
                    }));
                    setCicoHistory(formattedData);
                }
            } catch (error) {
                console.error("Error fetching CICO history:", error);
            }
        };

        fetchButtonStatus();
        fetchCICOData();

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

    // Haversine Formula for distance calculation
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const d = R * c; // in metres
        return d;
    };

    const validateAction = (type) => {
        if (!buttonData) return;

        const { ciThreshold, coThreshold, wpCondition } = buttonData;
        // Parse wpCondition: "lat, long, radius" e.g., " 13.689946114992614, 100.54990012579208, 150"
        let targetLat, targetLong, radius;
        if (wpCondition) {
            const parts = wpCondition.split(',').map(s => parseFloat(s.trim()));
            if (parts.length >= 3) {
                [targetLat, targetLong, radius] = parts;
            }
        }

        const currentTimeStr = currentDateTime.toTimeString().slice(0, 5); // "HH:MM"
        const dist = (targetLat && targetLong && coordinates.lat && coordinates.long)
            ? calculateDistance(coordinates.lat, coordinates.long, targetLat, targetLong)
            : 0;
        const isOutsideLocation = (radius && dist > radius);

        let messages = [];

        if (type === 'CheckIn') {
            const isLate = currentTimeStr > ciThreshold;

            if (isLate) {
                messages.push(`เกินเวลา ${ciThreshold} น.`);
            }
            if (isOutsideLocation) {
                messages.push("ตำแหน่งสถานที่ไม่ถูกต้อง");
            }
        } else if (type === 'CheckOut') {
            // "ห้ามเร็วกว่า" -> if current time is LESS than threshold, it's early
            const isEarly = currentTimeStr < coThreshold;

            if (isEarly) {
                messages.push(`ก่อนเวลา ${coThreshold} น.`);
            }
            if (isOutsideLocation) {
                messages.push("ตำแหน่งสถานที่ไม่ถูกต้อง");
            }
        }

        if (messages.length > 0) {
            setModalError(messages.join(" และ"));
            setActionType(type);
            setModalOpen(true);
        } else {
            // No anomalies, proceed directly
            console.log(`${type} Success (No Modal):`, {
                timestamp: new Date().toISOString(),
                coordinates,
                type
            });
        }
    };

    const handleCheckIn = () => {
        validateAction('CheckIn');
    };

    const handleCheckOut = () => {
        validateAction('CheckOut');
    };

    const handleModalSave = (reason) => {
        console.log(`${actionType} with Reason:`, {
            timestamp: new Date().toISOString(),
            coordinates,
            type: actionType,
            reason,
            error: modalError
        });
        setModalOpen(false);
    };

    const columns = [
        {
            title: 'วันที่',
            dataIndex: 'attDate',
            key: 'attDate',
            align: 'center',
            width: 150,
            SortName: 'attDate',
            render: (text) => {
                if (!text) return "-";
                // Assuming format YYYY-MM-DD, convert to Thai date if needed or keep as is.
                // For now keeping simple.
                return text;
            }
        },
        {
            title: 'Check-In',
            children: [
                {
                    title: 'เวลา (น.)',
                    dataIndex: 'ciTime',
                    key: 'ciTime',
                    align: 'center',
                    width: 100,
                    sorter: (a, b) => String(a.ciTime ?? "").localeCompare(String(b.ciTime ?? "")),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                },
                {
                    title: 'สถานะเวลา',
                    dataIndex: 'ciCorrectTime',
                    key: 'ciCorrectTime',
                    align: 'center',
                    width: 120,
                    sorter: (a, b) => String(a.ciCorrectTime ?? "").localeCompare(String(b.ciCorrectTime ?? "")),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                },
                {
                    title: 'สถานะตำแหน่ง',
                    dataIndex: 'ciCorrectZone',
                    key: 'ciCorrectZone',
                    align: 'center',
                    width: 200,
                    sorter: (a, b) => String(a.ciCorrectZone ?? "").localeCompare(String(b.ciCorrectZone ?? "")),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                },
                {
                    title: 'เหตุผล',
                    dataIndex: 'ciReason',
                    key: 'ciReason',
                    align: 'center',
                    width: 150,
                    sorter: (a, b) => String(a.ciReason ?? "").localeCompare(String(b.ciReason ?? "")),
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
                    dataIndex: 'coTime',
                    key: 'coTime',
                    align: 'center',
                    width: 100,
                    sorter: (a, b) => String(a.coTime ?? "").localeCompare(String(b.coTime ?? "")),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                },
                {
                    title: 'สถานะเวลา',
                    dataIndex: 'coCorrectTime',
                    key: 'coCorrectTime',
                    align: 'center',
                    width: 120,
                    sorter: (a, b) => String(a.coCorrectTime ?? "").localeCompare(String(b.coCorrectTime ?? "")),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                },
                {
                    title: 'สถานะตำแหน่ง',
                    dataIndex: 'coCorrectZone',
                    key: 'coCorrectZone',
                    align: 'center',
                    width: 200,
                    sorter: (a, b) => String(a.coCorrectZone ?? "").localeCompare(String(b.coCorrectZone ?? "")),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                },
                {
                    title: 'เหตุผล',
                    dataIndex: 'coReason',
                    key: 'coReason',
                    align: 'center',
                    width: 150,
                    sorter: (a, b) => String(a.coReason ?? "").localeCompare(String(b.coReason ?? "")),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    ),
                },
            ]
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
                                <div style={{ width: "100%", border: "1px solid #000" }}>
                                    {loadError && (
                                        <div style={{ color: "red" }}>
                                            โหลดแผนที่ไม่สำเร็จ (เช็ค API key / เปิด Maps JavaScript API)
                                        </div>
                                    )}

                                    {!isLoaded ? (
                                        <div
                                            style={{
                                                width: "100%",
                                                height: "320px",
                                                backgroundColor: "#e0e0e0",
                                                borderRadius: "10px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#757575",
                                            }}
                                        >
                                            Loading map...
                                        </div>
                                    ) : (
                                        <GoogleMap
                                            mapContainerStyle={mapContainerStyle}
                                            center={mapCenter}
                                            zoom={16}
                                            options={mapOptions}
                                        >
                                            {/* User Location Marker */}
                                            {coordinates.lat !== null && coordinates.long !== null && (
                                                <MarkerF
                                                    position={mapCenter}
                                                    icon={{
                                                        url: blueDotIconUrl,
                                                        scaledSize: new window.google.maps.Size(24, 24),
                                                        anchor: new window.google.maps.Point(12, 12),
                                                    }}
                                                />
                                            )}

                                            {/* Geofence Circle */}
                                            {geofence && (
                                                <CircleF
                                                    center={{ lat: geofence.lat, lng: geofence.lng }}
                                                    radius={geofence.radius}
                                                    options={{
                                                        strokeColor: "#FF0000",
                                                        strokeOpacity: 0.8,
                                                        strokeWeight: 2,
                                                        fillColor: "#FF0000",
                                                        fillOpacity: 0.35,
                                                    }}
                                                />
                                            )}
                                        </GoogleMap>
                                    )}
                                </div>
                            </Col>

                        </Row>
                    </Card.Body>


                </Card>

                {/* Action Buttons */}
                <div style={{ display: "flex", justifyContent: "center", gap: "40px", marginTop: "30px" }}>
                    <CheckInBtn
                        onClick={handleCheckIn}
                        disabled={!buttonData?.canCi}
                        style={{
                            "--bs-btn-bg": buttonData?.canCi ? "#D7FFDB" : "#EFEFF0",
                            "--bs-btn-disabled-bg": "#EFEFF0",
                            "--bs-btn-disabled-border-color": "#000",
                            opacity: 1 // Override default bootstrap disabled opacity if we want specific color
                        }}
                    />
                    <CheckOutBtn
                        onClick={handleCheckOut}
                        disabled={!buttonData?.canCo}
                        style={{
                            "--bs-btn-bg": buttonData?.canCo ? "#FFBCBC" : "#EFEFF0",
                            "--bs-btn-disabled-bg": "#EFEFF0",
                            "--bs-btn-disabled-border-color": "#000",
                            opacity: 1
                        }}
                    />
                </div>

                <div style={{ marginTop: "5px", fontWeight: "normal", fontSize: "22px", color: "#000000ff" }}>
                    Attendance History
                </div>

                <div style={{ marginTop: "5px" }}>
                    <TableUI
                        columns={columns}
                        dataSource={cicoHistory}
                        pagination={false}
                        bordered={true}
                        size="large"
                    />
                </div>

            </Card>

            <ReasonModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleModalSave}
                errorMessage={modalError}
            />

        </div>
    );
};

export default CheckInOut;
