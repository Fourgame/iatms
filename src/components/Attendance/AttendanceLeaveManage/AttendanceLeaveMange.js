import { useState, useEffect } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { GoogleMap, MarkerF, CircleF, useJsApiLoader } from "@react-google-maps/api";
import { DatePicker, Select, Form, Modal, Input, Button, TimePicker } from 'antd';
import { SearchToolBtnBootstrap, ClearToolBtnBootstrap, AddToolBtnBootstrap, EditToolBtnBootstrap, DeleteToolBtn, CloseModalBtnBootstrap, CloseIconBtn, SubmitModalBtnBootstrap } from '../../Utilities/Buttons/Buttons';
import { RejectTag, ApproveTag, PendingApproveTag } from "../../Utilities/StatusTag/StatusTag";
import { getAttChange, getModalAttChange, postAttChange, deleteAttChange } from '../../../services/att-change.service';
import { getLeave } from '../../../services/leave.service';
import TokenService from '../../../services/token.service';
import TableUI from '../../Utilities/Table/TableUI';
import { getDropdown } from '../../../services/dropdown.service';
import { noticeShowMessage } from '../../Utilities/Notification';
import Loading from "../../Utilities/Loading";
import moment from 'moment';
import { getButton } from '../../../services/CICO.service';

const { Option } = Select;

const EditAttModal = ({ show, onClose, data, onSuccess }) => {
    const [form] = Form.useForm();
    const [ciNewLocation, setCiNewLocation] = useState(null);
    const [coNewLocation, setCoNewLocation] = useState(null);
    const [ciNewAddress, setCiNewAddress] = useState("");
    const [coNewAddress, setCoNewAddress] = useState("");
    const [ciNewTime, setCiNewTime] = useState(null);
    const [coNewTime, setCoNewTime] = useState(null);
    const [geofence, setGeofence] = useState(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        language: 'th',
        region: 'TH'
    });

    // ✅ Reserve fixed space for validation/help text so left/right stay aligned
    const HELP_SPACE = 22;
    const fixedHelp = (msg) => (
        <div
            style={{
                minHeight: HELP_SPACE,
                marginTop: 4,
                fontSize: 12,
                lineHeight: `${HELP_SPACE}px`,
                color: msg ? "#ff4d4f" : "transparent",
            }}
        >
            {msg || "\u00A0"}
        </div>
    );

    useEffect(() => {
        if (show && data) {
            form.resetFields(); // <-- Added to clear previous validation errors
            form.setFieldsValue({
                attDate: data.attDate,
                ciTime: data.ciTime,
                ciCorrectTime: data.ciCorrectTime,
                ciAddress: data.ciAddress,
                ciLatlong: data.ciLatlong,
                ciCorrectZone: data.ciCorrectZone,
                ciReason: data.ciReason,
                coTime: data.coTime,
                coCorrectTime: data.coCorrectTime,
                coAddress: data.coAddress,
                coLatlong: data.coLatlong,
                coCorrectZone: data.coCorrectZone,
                coReason: data.coReason,

                // optional: reset new fields too
                ciNewLocation: null,
                coNewLocation: null,
                ciNewTime: null,
                coNewTime: null,
            });

            setCiNewLocation(null);
            setCoNewLocation(null);
            setCiNewAddress("");
            setCoNewAddress("");
            setCiNewTime(null);
            setCoNewTime(null);
            setCiNewAddress("");
            setCoNewAddress("");
            setCiNewTime(null);
            setCoNewTime(null);
        }
    }, [show, data, form]);

    useEffect(() => {
        const fetchButtonStatus = async () => {
            try {
                const response = await getButton.get_button();
                if (response.data && response.data.wpCondition) {
                    const parts = response.data.wpCondition.split(',').map(part => parseFloat(part.trim()));
                    if (parts.length === 3 && !parts.some(isNaN)) {
                        setGeofence({
                            lat: parts[0],
                            lng: parts[1],
                            radius: parts[2]
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching button status:", error);
            }
        };
        if (show) {
            fetchButtonStatus();
        }
    }, [show]);

    const parseLatLong = (latlongStr) => {
        if (!latlongStr || typeof latlongStr !== 'string') return null;
        const parts = latlongStr.split(',').map(s => parseFloat(s.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return { lat: parts[0], lng: parts[1] };
        }
        return null;
    };

    const handleReverseGeocode = (lat, lng, type) => {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results[0]) {
                if (type === 'ci') {
                    setCiNewAddress(results[0].formatted_address);
                } else {
                    setCoNewAddress(results[0].formatted_address);
                }
            } else {
                console.error("Geocoder failed due to: " + status);
            }
        });
    };

    // ✅ Also set form value so required rule can pass correctly
    const handleMapClick = (e, type) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        const fieldName = type === "ci" ? "ciNewLocation" : "coNewLocation";

        if (type === 'ci') {
            setCiNewLocation({ lat, lng });
            form.setFieldValue(fieldName, `${lat}, ${lng}`);
            form.setFields([{ name: fieldName, errors: [] }]);
            handleReverseGeocode(lat, lng, 'ci');
        } else {
            setCoNewLocation({ lat, lng });
            form.setFieldValue(fieldName, `${lat}, ${lng}`);
            form.setFields([{ name: fieldName, errors: [] }]);
            handleReverseGeocode(lat, lng, 'co');
        }
    };

    // ✅ Reserve help space on both columns to keep same height
    const renderMapSection = (type, latLongStr, currentZone, newLocation, setNewLocation, originalAddress, newAddress) => {
        if (currentZone !== 'นอกสถานที่') return null;

        const fieldName = type === 'ci' ? 'ciNewLocation' : 'coNewLocation';
        const msg = `กรุณาระบุตำแหน่ง${type === 'ci' ? 'เข้า' : 'ออก'}ที่ขอแก้ไข`;

        const originalLocation = parseLatLong(latLongStr);
        const mapContainerStyle = { width: '100%', height: '250px', borderRadius: '8px' };
        const center = originalLocation || { lat: 13.7563, lng: 100.5018 }; // Default Bangkok

        return (
            <Row className="mt-3">
                <Col md={6}>
                    <span style={{ color: "red" }}> * </span>
                    <span style={{ fontWeight: 'bold', marginBottom: '5px' }}>ตำแหน่งที่ผิดปกติ</span>

                    {/* Display Original Address */}
                    <div style={{
                        marginBottom: '10px',
                        padding: '8px',
                        border: '1px solid #ff4d4f',
                        borderRadius: '4px',
                        backgroundColor: '#fff1f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        height: '42px'
                    }}>
                        <span>{originalAddress || "-"}</span>
                        <CloseIconBtn style={{ color: 'red', cursor: 'default' }} />
                    </div>

                    {/* ✅ keep equal vertical space with the right column help */}
                    {fixedHelp()}

                    {isLoaded && originalLocation ? (
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={originalLocation}
                            zoom={15}
                            options={{ disableDefaultUI: true, draggable: false, zoomControl: true }}
                        >
                            <MarkerF position={originalLocation} />
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
                    ) : (
                        <div style={{ ...mapContainerStyle, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Map Loading...
                        </div>
                    )}
                </Col>

                <Col md={6}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>เลือกตำแหน่งใหม่</div>

                    {/* ✅ always render Form.Item with fixed help space */}
                    <Form.Item shouldUpdate noStyle>
                        {() => {
                            const err = form.getFieldError(fieldName)?.[0];

                            return (
                                <Form.Item
                                    name={fieldName}
                                    style={{ marginBottom: 0, width: '100%' }}
                                    rules={[{ required: currentZone === 'นอกสถานที่', message: msg }]}
                                    validateStatus={err ? "error" : undefined}
                                    help={fixedHelp(err)}
                                >
                                    <div style={{
                                        marginBottom: '10px',
                                        padding: '8px',
                                        border: '1px solid #000',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        height: '42px',
                                        color: newLocation ? "#000" : '#888888ff'
                                    }}>
                                        {newLocation ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                                <i className="fas fa-map-marker-alt" ></i>
                                                <span title={newAddress}>{newAddress}</span>
                                            </div>
                                        ) : (
                                            "กรุณาเลือกตำแหน่งในแผนที่เพื่อระบุตำแหน่ง"
                                        )}
                                        <i className="fas fa-chevron-down"></i>
                                    </div>
                                </Form.Item>
                            );
                        }}
                    </Form.Item>

                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={newLocation || center}
                            zoom={15}
                            onClick={(e) => handleMapClick(e, type)}
                            options={{ disableDefaultUI: true, zoomControl: true }}
                        >
                            {newLocation && <MarkerF position={newLocation} />}
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
                                    onClick={(e) => handleMapClick(e, type)}
                                />
                            )}
                        </GoogleMap>
                    ) : (
                        <div style={{ ...mapContainerStyle, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Map Loading...
                        </div>
                    )}
                </Col>
            </Row>
        );
    };

    // ✅ Reserve help space on left and right for time section too
    const renderTimeSection = (type, timeStr, correctTimeStatus, newTime, setNewTime) => {
        let isInvalid = false;
        if (type === 'ci') {
            if (correctTimeStatus && correctTimeStatus.includes('เกินเวลา')) isInvalid = true;
        } else {
            if (correctTimeStatus && (correctTimeStatus.includes('ก่อนเวลา') || correctTimeStatus.includes('ข้ามวัน'))) isInvalid = true;
        }

        if (!isInvalid) {
            return (
                <div style={{ display: 'flex', marginBottom: '10px' }}>
                    <div style={{ width: '80px', fontWeight: 'bold' }}>เวลา</div>
                    <div style={{ flex: 1 }}>{timeStr || "-"} น.</div>
                </div>
            );
        }

        const fieldName = type === "ci" ? "ciNewTime" : "coNewTime";
        const msg = `กรุณาระบุเวลา${type === 'ci' ? 'เข้า' : 'ออก'}ที่ขอแก้ไข`;

        return (
            <Row className="mb-2 align-items-start">
                <Col md={6}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: "red" }}> * </span>
                        <div style={{ width: '80px', fontWeight: 'bold' }}>เวลา</div>

                        {/* Invalid Time Display */}
                        <div style={{
                            flex: 1,
                            padding: '4px 8px',
                            border: '1px solid #ff0000ff',
                            borderRadius: '4px',
                            backgroundColor: '#fff1f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: '35px'
                        }}>
                            <span>{timeStr || "-"}</span>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ borderLeft: '1px dotted #ff4d4f', paddingLeft: '5px', marginLeft: '5px', color: '#ff4d4f' }}>น.</div>
                                <CloseIconBtn style={{ color: 'red', cursor: 'default', marginLeft: '5px' }} />
                            </div>
                        </div>
                    </div>

                    {/* ✅ keep equal height with right help */}
                    {fixedHelp()}
                </Col>

                <Col md={6}>
                    <Form.Item shouldUpdate noStyle>
                        {() => {
                            const err = form.getFieldError(fieldName)?.[0];

                            return (
                                <Form.Item
                                    name={fieldName}
                                    style={{ marginBottom: 0, width: '100%' }}
                                    rules={[{ required: isInvalid, message: msg }]}
                                    validateStatus={err ? "error" : undefined}
                                    help={fixedHelp(err)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #000', borderRadius: '4px', padding: '0 5px', height: '35px', width: '100%' }}>
                                        <TimePicker
                                            value={newTime}
                                            onChange={(time) => {
                                                setNewTime(time);
                                                form.setFieldValue(fieldName, time);
                                                form.setFields([{ name: fieldName, errors: [] }]);
                                            }}
                                            format="HH:mm"
                                            placeholder="00:00"
                                            bordered={false}
                                            style={{ flex: 1 }}
                                            suffixIcon={<i className="far fa-clock" style={{ color: '#000' }}></i>}
                                        />
                                        <div style={{ borderLeft: '1px solid #000', paddingLeft: '5px', height: '100%', display: 'flex', alignItems: 'center' }}>น.</div>
                                    </div>
                                </Form.Item>
                            );
                        }}
                    </Form.Item>
                </Col>
            </Row>
        );
    };

    return (
        <Modal
            title={
                <div style={{
                    backgroundColor: '#2750B0',
                    color: 'white',
                    padding: '16px 24px',
                    margin: '-20px -24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '16px',
                    fontWeight: '600',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                }}>
                    <span>Attendance Change Detail</span>
                </div>
            }
            open={show}
            onCancel={onClose}
            footer={null}
            width={2000}
            styles={{ header: { padding: 0, borderBottom: 'none' }, body: { padding: '24px' }, content: { padding: 0, overflow: 'hidden', borderRadius: '8px' } }}
            closeIcon={<CloseIconBtn />}
            centered
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={async (values) => {
                    // To ensure proper DateTime mapping for C# backend, formatting time with date if possible,
                    // otherwise falling back to what was logged.
                    const formatTime = (timeValue) => {
                        if (!timeValue) return null;
                        if (timeValue && typeof timeValue.format === 'function') {
                            return `${data?.attDate || ''}T${timeValue.format("HH:mm")}:00`;
                        }
                        if (typeof timeValue === 'string' && timeValue.length <= 5) {
                            return `${data?.attDate || ''}T${timeValue}:00`;
                        }
                        return timeValue;
                    };

                    const payload = {
                        at_date: data?.attDate || null,
                        ci_time_old: formatTime(data?.ciTime),
                        ci_time_new: formatTime(ciNewTime),
                        ci_location_old: data?.ciLatlong || null,
                        ci_location_new: ciNewLocation ? `${ciNewLocation.lat}, ${ciNewLocation.lng}` : null,
                        ci_address_old: data?.ciAddress || null,
                        ci_address_new: ciNewAddress || null,
                        ci_request_reason: data?.ciReason || null,
                        co_time_old: formatTime(data?.coTime),
                        co_time_new: formatTime(coNewTime),
                        co_location_old: data?.coLatlong || null,
                        co_location_new: coNewLocation ? `${coNewLocation.lat}, ${coNewLocation.lng}` : null,
                        co_address_old: data?.coAddress || null,
                        co_address_new: coNewAddress || null,
                        co_request_reason: data?.coReason || null,
                        request_reason: values.requestReason || null
                    };

                    console.log("Submit Payload:", payload);

                    try {
                        const response = await postAttChange.post_att_change(payload);
                        if (response.data || response.status === 200) {
                            noticeShowMessage("บันทึกข้อมูลสำเร็จ", false);
                            if (onSuccess) onSuccess();
                            onClose();
                        } else {
                            noticeShowMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล", true);
                        }
                    } catch (error) {
                        console.error("Error submitting attendance change:", error);
                        noticeShowMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล", true);
                    }
                }}
            >
                <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '10px' }}>
                    วันที่ {data?.attDate ? moment(data.attDate).format("DD/MM/YYYY") : "-"}
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                    {/* Check-In Card */}
                    <Card className="mb-3" style={{ border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden', width: '50%', height: '50%' }}>
                        <Card.Header style={{ backgroundColor: '#f0f2f5', fontWeight: 'bold', borderBottom: '1px solid #d9d9d9' }}>
                            เวลาเข้า
                        </Card.Header>
                        <Card.Body className="p-3">
                            {renderTimeSection('ci', data?.ciTime, data?.ciCorrectTime, ciNewTime, setCiNewTime)}
                            {data?.ciCorrectZone === 'นอกสถานที่' ? (
                                renderMapSection('ci', data?.ciLatlong, data?.ciCorrectZone, ciNewLocation, setCiNewLocation, data?.ciAddress, ciNewAddress)
                            ) : (
                                <div style={{ display: 'flex', marginBottom: '10px' }}>
                                    <div style={{ width: '80px', fontWeight: 'bold' }}>ตำแหน่ง</div>
                                    <div style={{ flex: 1 }}>{data?.ciAddress || "-"}</div>
                                </div>
                            )}
                            <div style={{ display: 'flex', marginBottom: '0' }}>
                                <div style={{ width: '80px', fontWeight: 'bold' }}>เหตุผล</div>
                                <div style={{ flex: 1 }}>{data?.ciReason || "-"}</div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Check-Out Card */}
                    <Card className="mb-3" style={{ border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden', width: '50%', height: '50%' }}>
                        <Card.Header style={{ backgroundColor: '#f0f2f5', fontWeight: 'bold', borderBottom: '1px solid #d9d9d9' }}>
                            เวลาออก
                        </Card.Header>
                        <Card.Body className="p-3">
                            {renderTimeSection('co', data?.coTime, data?.coCorrectTime, coNewTime, setCoNewTime)}
                            {data?.coCorrectZone === 'นอกสถานที่' ? (
                                renderMapSection('co', data?.coLatlong, data?.coCorrectZone, coNewLocation, setCoNewLocation, data?.coAddress, coNewAddress)
                            ) : (
                                <div style={{ display: 'flex', marginBottom: '10px' }}>
                                    <div style={{ width: '80px', fontWeight: 'bold' }}>ตำแหน่ง</div>
                                    <div style={{ flex: 1 }}>{data?.coAddress || "-"}</div>
                                </div>
                            )}
                            <div style={{ display: 'flex', marginBottom: '0' }}>
                                <div style={{ width: '80px', fontWeight: 'bold' }}>เหตุผล</div>
                                <div style={{ flex: 1 }}>{data?.coReason || "-"}</div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>

                {/* Request Reason Card */}
                <Card className="mb-3" style={{ border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
                    <Card.Header style={{ backgroundColor: '#f0f2f5', fontWeight: 'bold', borderBottom: '1px solid #d9d9d9' }}>
                        <span style={{ color: 'red', marginRight: '5px' }}>*</span>เหตุผลที่ร้องขอ
                    </Card.Header>
                    <Card.Body className="p-3">
                        <Form.Item
                            name="requestReason"
                            style={{ marginBottom: 0 }}
                            rules={[{ required: true, message: 'กรุณาระบุเหตุผลที่ร้องขอ' }]}
                        >
                            <Input.TextArea rows={4} placeholder="ระบุเหตุผลที่ขอแก้ไข..." style={{ resize: 'none' }} />
                        </Form.Item>
                    </Card.Body>
                </Card>

                <div className="modal-footer justify-content-center border-top-0 pb-0 pt-3" style={{ gap: '20px' }}>
                    <SubmitModalBtnBootstrap
                        onClick={() => form.submit()}
                    >
                    </SubmitModalBtnBootstrap>

                    <div style={{ width: '30px' }}></div>

                    <CloseModalBtnBootstrap
                        onClick={onClose}
                    >
                    </CloseModalBtnBootstrap>
                </div>
            </Form>
        </Modal>
    );
};

const AttendanceLeaveMange = () => {
    // Attendance Change State
    const [attStartDate, setAttStartDate] = useState(null);
    const [attEndDate, setAttEndDate] = useState(null);
    const [attStatus, setAttStatus] = useState("ทั้งหมด");
    const [attStatusList, setAttStatusList] = useState([]);
    const [attChangeData, setAttChangeData] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editModalData, setEditModalData] = useState(null);
    const [isRejectReasonModalOpen, setIsRejectReasonModalOpen] = useState(false);
    const [rejectReasonText, setRejectReasonText] = useState("");

    // Leave Request State
    const [leaveStartDate, setLeaveStartDate] = useState(null);
    const [leaveEndDate, setLeaveEndDate] = useState(null);
    const [leaveStatus, setLeaveStatus] = useState("ทั้งหมด");
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

    const handleShowRejectReason = (reason) => {
        setRejectReasonText(reason || "-");
        setIsRejectReasonModalOpen(true);
    };

    const handleEditAtt = async (record) => {
        setLoading(true);
        console.log("Editing Record:", record);
        try {
            const response = await getModalAttChange.get_modal_att_change({ Date: record.attDate });
            console.log("API Response:", response);

            if (response.data) {
                let modalData = response.data;
                // If the response is an array, take the first element
                if (Array.isArray(modalData)) {
                    modalData = modalData.length > 0 ? modalData[0] : null;
                }

                if (modalData) {
                    console.log("Setting Modal Data:", modalData);
                    setEditModalData(modalData);
                    setIsEditModalOpen(true);
                } else {
                    noticeShowMessage("ไม่พบข้อมูลรายละเอียด", true);
                }
            } else {
                noticeShowMessage("ไม่พบข้อมูลรายละเอียด", true);
            }
        } catch (error) {
            console.error("Error fetching modal data:", error);
            noticeShowMessage("เกิดข้อผิดพลาดในการดึงข้อมูล", true);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAtt = (record) => {
        Modal.confirm({
            title: 'ยืนยันการลบข้อมูล',
            content: `คุณต้องการลบข้อมูลการขอแก้ไขเวลาของวันที่ ${record.attDate ? moment(record.attDate).format("DD/MM/YYYY") : "-"} ใช่หรือไม่?`,
            okText: 'ยืนยัน',
            okType: 'danger',
            cancelText: 'ยกเลิก',
            centered: true,
            onOk: async () => {
                setLoading(true);
                try {
                    const response = await deleteAttChange.delete_att_change({ Date: record.attDate });
                    if (response.data || response.status === 200) {
                        noticeShowMessage("ลบข้อมูลสำเร็จ", false);
                        handleAttSearch();
                    } else {
                        noticeShowMessage("เกิดข้อผิดพลาดในการลบข้อมูล", true);
                    }
                } catch (error) {
                    console.error("Error deleting attendance change:", error);
                    noticeShowMessage("เกิดข้อผิดพลาดในการลบข้อมูล", true);
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const attColumns = [
        {
            title: '',
            key: 'action',
            render: (text, record) => (
                <div style={{ textAlign: 'center', display: 'flex', gap: '5px', justifyContent: 'center' }}>
                    {record.action === 'edit' && <EditToolBtnBootstrap onClick={() => handleEditAtt(record)} />}
                    {record.action === 'delete' && <DeleteToolBtn onClick={() => handleDeleteAtt(record)} />}
                </div>
            ),
            width: 80,
            align: 'center'
        },
        {
            title: 'วันที่',
            dataIndex: 'attDate',
            key: 'attDate',
            align: 'center',
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
                    align: 'left',
                    width: 120,
                    sorter: (a, b) => String(a.ciLocation ?? "").localeCompare(String(b.ciLocation ?? "")),
                    render: (text) => text ?? "-"
                },
                {
                    title: 'เหตุผล',
                    dataIndex: 'ciReason',
                    key: 'ciReason',
                    align: 'left',
                    width: 120,
                    sorter: (a, b) => String(a.ciReason ?? "").localeCompare(String(b.ciReason ?? "")),
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
                    sorter: (a, b) => String(a.ciTimeNew ?? "").localeCompare(String(b.ciTimeNew ?? "")),
                    render: (text) => text ?? "-"
                },
                {
                    title: 'ตำแหน่งที่ขอแก้ไข',
                    dataIndex: 'ciLocationNew',
                    key: 'ciLocationNew',
                    align: 'left',
                    width: 120,
                    sorter: (a, b) => String(a.ciLocationNew ?? "").localeCompare(String(b.ciLocationNew ?? "")),
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
                    align: 'left',
                    width: 120,
                    sorter: (a, b) => String(a.coLocation ?? "").localeCompare(String(b.coLocation ?? "")),
                    render: (text) => text ?? "-"
                },
                {
                    title: 'เหตุผล',
                    dataIndex: 'coReason',
                    key: 'coReason',
                    align: 'left',
                    width: 120,
                    sorter: (a, b) => String(a.coReason ?? "").localeCompare(String(b.coReason ?? "")),
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
                    sorter: (a, b) => String(a.coTimeNew ?? "").localeCompare(String(b.coTimeNew ?? "")),
                    render: (text) => text ?? "-"
                },
                {
                    title: 'ตำแหน่งที่ขอแก้ไข',
                    dataIndex: 'coLocationNew',
                    key: 'coLocationNew',
                    align: 'left',
                    width: 120,
                    sorter: (a, b) => String(a.coLocationNew ?? "").localeCompare(String(b.coLocationNew ?? "")),
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

            render: (text, record) => {
                const status = text ? String(text).trim() : "-";
                switch (status) {
                    case 'Rj': return <RejectTag onClick={() => handleShowRejectReason(record.rejectReason)} />;
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
        },
        {
            title: 'สถานะ',
            dataIndex: 'status_request',
            key: 'status_request',
            align: 'center',
            width: 120,
            sorter: (a, b) => String(a.status_request ?? "").localeCompare(String(b.status_request ?? "")),
            render: (text, record) => {
                const status = text ? String(text).trim() : "-";
                switch (status) {
                    case 'Rejected': return <RejectTag onClick={() => handleShowRejectReason(record.reason)} />;
                    case 'Approved': return <ApproveTag />;
                    case 'Pending Approval': return <PendingApproveTag />;
                    default: return status;
                }
            }
        },
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
                                    disabledDate={(current) => {
                                        return attEndDate ? current && current > attEndDate.endOf('day') : false;
                                    }}
                                    style={{ width: 140 }}
                                />
                                <span>-</span>
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    placeholder="DD/MM/YYYY"
                                    inputReadOnly={true}
                                    value={attEndDate}
                                    onChange={(date) => setAttEndDate(date)}
                                    disabledDate={(current) => {
                                        return attStartDate ? current && current < attStartDate.startOf('day') : false;
                                    }}
                                    style={{ width: 140 }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Form component={false}>
                                <Form.Item label={<span style={{ fontWeight: 700, fontSize: '16px' }}>สถานะคำขอ</span>} style={{ marginBottom: 0 }}>
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

            <EditAttModal
                show={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                data={editModalData}
                onSuccess={handleAttSearch}
            />

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
                                <Form.Item label={<span style={{ fontWeight: 700, fontSize: '16px' }}>สถานะคำขอ</span>} style={{ marginBottom: 0 }}>
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

            {/* Reject Reason Modal */}
            <Modal
                title={
                    <div style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        padding: '16px 24px',
                        margin: '-20px -24px',
                        fontSize: '16px',
                        fontWeight: '600',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                    }}>
                        เหตุผล reject
                    </div>
                }
                open={isRejectReasonModalOpen}
                onCancel={() => setIsRejectReasonModalOpen(false)}
                footer={null}
                width={500}
                styles={{ header: { padding: 0, borderBottom: 'none' }, body: { padding: '24px' }, content: { padding: 0, overflow: 'hidden', borderRadius: '8px' } }}
                closeIcon={<CloseIconBtn />}
                centered
            >
                <div style={{ fontSize: '16px', wordWrap: 'break-word', color: '#000' }}>
                    {rejectReasonText}
                </div>
            </Modal>
        </div>
    );
};

export default AttendanceLeaveMange;