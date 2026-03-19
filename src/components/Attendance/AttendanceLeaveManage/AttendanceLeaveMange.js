import { useState, useEffect, useRef } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, MarkerF, CircleF, useJsApiLoader } from "@react-google-maps/api";
import { DatePicker, Select, Form, Input, TimePicker, Modal, Button, Checkbox } from 'antd';
import { SearchToolBtnBootstrap, ClearToolBtnBootstrap, AddToolBtnBootstrap, EditToolBtnBootstrap, DeleteToolBtn, CloseModalBtnBootstrap, CloseIconBtn, SubmitModalBtnBootstrap } from '../../Utilities/Buttons/Buttons';
import { RejectTag, ApproveTag, PendingApproveTag } from "../../Utilities/StatusTag/StatusTag";
import { getAttChange, getModalAttChange, getLeaveHoliday, postAttChange, deleteAttChange } from '../../../services/att-change.service';
import { getLeave, postLeave, deleteLeave } from '../../../services/leave.service';
import TokenService from '../../../services/token.service';
import TableUI from '../../Utilities/Table/TableUI';
import { getDropdown } from '../../../services/dropdown.service';
import { noticeShowMessage } from '../../Utilities/Notification';
import Loading from "../../Utilities/Loading";
import moment from 'moment';
import Title from '../../Utilities/Title';
import { getButton } from '../../../services/CICO.service';
import dayjs from 'dayjs';
import TimePickerBootstrap from 'react-bootstrap-time-picker';

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

const { TextArea } = Input;

const { Option } = Select;

const EditAttModal = ({ show, onClose, data, onSuccess, geofence, isReadOnly = false }) => {
    const navigate = useNavigate();

    const handleRequestError = (error) => {
        if (error.response) {
            const status = error.response.status;
            if (status === 401) {
                TokenService.deleteUser();
                navigate("/signin", { state: { message: "please sign-in again." } });
                return true;
            }
            if (error.response.data && error.response.data.message) {
                noticeShowMessage(error.response.data.message, true);
                return false;
            }
            if (status === 403) {
                TokenService.deleteUser();
                navigate("/signin", { state: { message: "access-denied" } });
                return true;
            }
            if (status === 404) {
                navigate("/signin", { state: { message: "not-found" } });
                return true;
            }

        } else if (error.request) {
            console.log("No response received:", error.request);
            return navigate("/signin", { state: { message: "network-error" } });

        } else {
            console.log("Error setting up request:", error.message);
            return navigate("/signin", { state: { message: "error" } });
        }
        return false;
    };

    const [form] = Form.useForm();
    const modalFormWrapperRef = useRef(null);
    const [ciNewLocation, setCiNewLocation] = useState(null);
    const [coNewLocation, setCoNewLocation] = useState(null);
    const [ciNewAddress, setCiNewAddress] = useState("");
    const [coNewAddress, setCoNewAddress] = useState("");
    const [ciNewTime, setCiNewTime] = useState(null);
    const [coNewTime, setCoNewTime] = useState(null);

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

    const parseLatLong = (latlongStr) => {
        if (!latlongStr || typeof latlongStr !== 'string') return null;
        const parts = latlongStr.split(',').map(s => parseFloat(s.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return { lat: parts[0], lng: parts[1] };
        }
        return null;
    };

    useEffect(() => {
        if (show && data) {
            form.resetFields(); // <-- Added to clear previous validation errors
            form.setFieldsValue({
                attDate: data.attDate,
                ciTime: data.ciTimeOld,
                ciCorrectTime: data.ciCorrectTime,
                ciAddress: data.ciAddressOld,
                ciLatlong: data.ciLatlongOld,
                ciCorrectZone: data.ciCorrectZone,
                ciReason: data.ciReason,
                coTime: data.coTimeOld,
                coCorrectTime: data.coCorrectTime,
                coAddress: data.coAddressOld,
                coLatlong: data.coLatlongOld,
                coCorrectZone: data.coCorrectZone,
                coReason: data.coReason,

                // optional: reset new fields too
                ciNewLocation: data.ciLatlongNew ? data.ciLatlongNew : null,
                coNewLocation: data.coLatlongNew ? data.coLatlongNew : null,
                ciNewTime: data.ciTimeNew ? moment(data.ciTimeNew, "HH:mm") : null,
                coNewTime: data.coTimeNew ? moment(data.coTimeNew, "HH:mm") : null,
                requestReason: isReadOnly ? (data.requestReason || "") : "",
            });

            setCiNewLocation(data.ciLatlongNew ? parseLatLong(data.ciLatlongNew) : null);
            setCoNewLocation(data.coLatlongNew ? parseLatLong(data.coLatlongNew) : null);
            setCiNewAddress(data.ciAddressNew || "");
            setCoNewAddress(data.coAddressNew || "");
            setCiNewTime(data.ciTimeNew ? moment(data.ciTimeNew, "HH:mm") : null);
            setCoNewTime(data.coTimeNew ? moment(data.coTimeNew, "HH:mm") : null);
        }
    }, [show, data, form]);



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
        const fieldName = type === 'ci' ? 'ciNewLocation' : 'coNewLocation';
        const msg = `ระบุตำแหน่ง${type === 'ci' ? 'เข้า' : 'ออก'}ที่ขอแก้ไข`;

        const originalLocation = parseLatLong(latLongStr);
        const mapContainerStyle = { width: '100%', height: '250px', borderRadius: '8px' };
        const center = originalLocation || { lat: 13.7563, lng: 100.5018 }; // Default Bangkok

        // Dynamic styling for original location
        let originalMarkerColor = "#FF0000"; // Default Red
        let originalCircleColor = "#FF0000"; // Default Red
        if (geofence && originalLocation) {
            const dist = calculateDistance(originalLocation.lat, originalLocation.lng, geofence.lat, geofence.lng);
            if (dist <= geofence.radius) {
                originalMarkerColor = "#1eff00ff"; // Green
                originalCircleColor = "#28a745"; // Green
            }
        }

        const originalMarkerIconUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
                <path fill="${originalMarkerColor}" stroke="#000000ff" stroke-width="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-12-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
            </svg>
        `)}`;

        // Dynamic styling for new location
        let newMarkerColor = "#2750B0"; // Default Blue
        let newCircleColor = "#FF0000"; // Default Red
        if (geofence && newLocation) {
            const dist = calculateDistance(newLocation.lat, newLocation.lng, geofence.lat, geofence.lng);
            if (dist <= geofence.radius) {
                newMarkerColor = "#1eff00ff"; // Green
                newCircleColor = "#28a745"; // Green
            } else {
                newMarkerColor = "#ff0000ff"; // Red
            }
        }

        const newMarkerIconUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
                <path fill="${newMarkerColor}" stroke="#000000ff" stroke-width="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-12-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
            </svg>
        `)}`;

        return (
            <Row className="mt-3">
                <Col md={6}>
                    <span style={{ fontWeight: 'bold', marginBottom: '5px' }}>ตำแหน่งที่ผิดปกติ</span>

                    {/* Display Original Address */}
                    <div style={{
                        marginBottom: '10px',
                        color: 'red',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <span>{originalAddress || "-"}</span>
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
                            <MarkerF
                                position={originalLocation}
                                icon={{
                                    url: originalMarkerIconUrl,
                                    scaledSize: new window.google.maps.Size(24, 24),
                                    anchor: new window.google.maps.Point(12, 12),
                                }}
                            />
                            {geofence && (
                                <CircleF
                                    center={{ lat: geofence.lat, lng: geofence.lng }}
                                    radius={geofence.radius}
                                    options={{
                                        strokeColor: originalCircleColor,
                                        strokeOpacity: 0.8,
                                        strokeWeight: 2,
                                        fillColor: originalCircleColor,
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
                    {(isReadOnly && !newLocation) ? null : (
                        <>
                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{isReadOnly ? "ตำแหน่งที่ขอแก้ไข" : "เลือกตำแหน่งใหม่"}</div>

                            {/* ✅ always render Form.Item with fixed help space */}
                            {isReadOnly ? (
                                <>
                                    <div style={{
                                        marginBottom: '10px',
                                        color: '#28a745',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <span>{newAddress || "-"}</span>
                                    </div>
                                    {fixedHelp()}
                                </>
                            ) : (
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
                                                    marginBottom: '3px',
                                                    padding: '8px',
                                                    // border: '1px solid #000',
                                                    // borderRadius: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    height: '42px',
                                                    color: newLocation ? "#000" : '#888888ff'
                                                }}>
                                                    {newLocation ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', wordBreak: 'break-word' }}>
                                                            <i className="fas fa-map-marker-alt" ></i>
                                                            <span title={newAddress}>{newAddress}</span>
                                                        </div>
                                                    ) : (
                                                        ""
                                                    )}
                                                    <i className="fas fa-chevron-down"></i>
                                                </div>
                                            </Form.Item>
                                        );
                                    }}
                                </Form.Item>
                            )}

                            {isLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={newLocation || center}
                                    zoom={15}
                                    onClick={isReadOnly ? undefined : (e) => handleMapClick(e, type)}
                                    options={{ disableDefaultUI: true, zoomControl: true }}
                                >
                                    {newLocation && (
                                        <MarkerF
                                            position={newLocation}
                                            icon={{
                                                url: newMarkerIconUrl,
                                                scaledSize: new window.google.maps.Size(24, 24),
                                                anchor: new window.google.maps.Point(12, 12),
                                            }}
                                        />
                                    )}
                                    {geofence && (
                                        <CircleF
                                            center={{ lat: geofence.lat, lng: geofence.lng }}
                                            radius={geofence.radius}
                                            options={{
                                                strokeColor: newCircleColor,
                                                strokeOpacity: 0.8,
                                                strokeWeight: 2,
                                                fillColor: newCircleColor,
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
                        </>)}
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

        const fieldName = type === "ci" ? "ciNewTime" : "coNewTime";
        const msg = `ระบุเวลา${type === 'ci' ? 'เข้า' : 'ออก'}ที่ขอแก้ไข`;

        const readonlyBoxStyle = (hasError = false) => ({
            display: 'flex',
            alignItems: 'center',
            border: hasError ? '1px solid #ff4d4f' : '1px solid #000',
            borderRadius: '4px',
            padding: '0 5px',
            height: '35px',
            width: '100%',
            backgroundColor: '#fff',
            color: hasError ? 'red' : '#000'
        });

        const readonlyUnitStyle = (hasError = false) => ({
            borderLeft: hasError ? '1px solid #ff4d4f' : '1px solid #000',
            paddingLeft: '5px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            marginLeft: 'auto'
        });

        return (
            <Row className="mb-2 align-items-start">
                <Col md={6}>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div
                            style={{
                                width: '80px',
                                fontWeight: 'bold',
                                height: '35px',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            เวลา
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                                style={{
                                    height: '35px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: isReadOnly && newTime ? 'red' : (isInvalid ? 'red' : '#000')
                                }}
                            >
                                <span>{timeStr || "-"} น.</span>
                            </div>

                            {fixedHelp()}
                        </div>
                    </div>
                </Col>

                <Col md={6}>
                    {isReadOnly ? (
                        newTime ? (
                            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <div
                                    style={{
                                        fontWeight: 'bold',
                                        height: '35px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginRight: '15px',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    เวลาที่ขอแก้ไข
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            border: '1px solid #ffffffff',
                                            borderRadius: '4px',
                                            padding: '0 5px',
                                            height: '35px',
                                            width: '100%',
                                            backgroundColor: '#fff',
                                            color: '#28a745'
                                        }}
                                    >
                                        <div style={{ flex: 1, padding: '0 6px' }}>
                                            <span>{typeof newTime.format === 'function' ? newTime.format('HH:mm') : newTime} น.</span>
                                        </div>
                                        {/* <div
                                            style={{
                                                borderLeft: '1px solid #ffffffff',
                                                paddingLeft: '5px',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            น.
                                        </div> */}
                                    </div>
                                    {fixedHelp()}
                                </div>
                            </div>
                        ) : null
                    ) : isInvalid ? (
                        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <div
                                style={{
                                    fontWeight: 'bold',
                                    height: '35px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginRight: '15px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                เลือกเวลาใหม่
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
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
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        border: err ? '1px solid #ff4d4f' : '1px solid #000',
                                                        borderRadius: '4px',
                                                        padding: '0 5px',
                                                        height: '35px',
                                                        width: '100%'
                                                    }}
                                                >
                                                    {/*
                                                    <TimePicker
                                                        value={newTime}
                                                        inputReadOnly={true}
                                                        defaultOpenValue={dayjs('00:00', 'HH:mm')}
                                                        hideDisabledOptions={true}
                                                        onChange={(time) => {
                                                            setNewTime(time);
                                                            form.setFieldValue(fieldName, time);
                                                            form.setFields([{ name: fieldName, errors: [] }]);
                                                            requestAnimationFrame(() => modalFormWrapperRef.current?.focus());
                                                        }}
                                                        onClick={() => {
                                                            if (newTime) {
                                                                setNewTime(null);
                                                                form.setFieldValue(fieldName, null);
                                                            }
                                                        }}
                                                        format="HH:mm"
                                                        placeholder="00:00"
                                                        bordered={false}
                                                        style={{ flex: 1 }}
                                                        suffixIcon={<i className="far fa-clock" style={{ color: '#000' }}></i>}
                                                    />
                                                    */}
                                                    <TimePickerBootstrap
                                                        start="00:00"
                                                        end="23:59"
                                                        step={30}
                                                        format={24}
                                                        value={newTime ? (typeof newTime.format === 'function' ? newTime.format('HH:mm') : newTime) : null}
                                                        onChange={(timeInt) => {
                                                            if (timeInt || timeInt === 0) {
                                                                const h = Math.floor(timeInt / 3600);
                                                                const m = Math.floor((timeInt % 3600) / 60);
                                                                const timeObj = moment().hour(h).minute(m).second(0);
                                                                setNewTime(timeObj);
                                                                form.setFieldValue(fieldName, timeObj);
                                                                form.setFields([{ name: fieldName, errors: [] }]);
                                                                requestAnimationFrame(() => modalFormWrapperRef.current?.focus());
                                                            } else {
                                                                setNewTime(null);
                                                                form.setFieldValue(fieldName, null);
                                                            }
                                                        }}
                                                        className="form-select border-0 shadow-none"
                                                        style={{ flex: 1, border: 'none', boxShadow: 'none', height: '100%', backgroundColor: 'transparent', padding: '0 8px' }}
                                                    />
                                                    <div
                                                        style={{
                                                            borderLeft: err ? '1px solid #ff4d4f' : '1px solid #000',
                                                            paddingLeft: '5px',
                                                            height: '100%',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        น.
                                                    </div>
                                                </div>
                                            </Form.Item>
                                        );
                                    }}
                                </Form.Item>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <div
                                style={{
                                    fontWeight: 'bold',
                                    height: '35px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginRight: '15px',
                                    whiteSpace: 'nowrap',
                                    visibility: 'hidden'
                                }}
                            >
                                เลือกเวลาใหม่
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ height: '35px', width: '100%' }} />
                                {fixedHelp()}
                            </div>
                        </div>
                    )}
                </Col>
            </Row >
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
            zIndex={9999}
            styles={{ header: { padding: 0, borderBottom: 'none' }, body: { padding: '24px' }, content: { padding: 0, overflow: 'hidden', borderRadius: '8px' } }}
            closeIcon={<CloseIconBtn />}
            centered
        >
            <div ref={modalFormWrapperRef} tabIndex={-1} style={{ outline: 'none' }} onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    if (e.target.tagName === 'TEXTAREA' || e.target.closest('.ant-select-dropdown')) return;
                    e.preventDefault();
                    form.submit();
                }
            }}>
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
                            ci_time_old: formatTime(data?.ciTimeOld),
                            ci_time_new: formatTime(ciNewTime),
                            ci_location_old: data?.ciLatlongOld || null,
                            ci_location_new: ciNewLocation ? `${ciNewLocation.lat}, ${ciNewLocation.lng}` : null,
                            ci_address_old: data?.ciAddressOld || null,
                            ci_address_new: ciNewAddress || null,
                            ci_request_reason: data?.ciReason || null,
                            co_time_old: formatTime(data?.coTimeOld),
                            co_time_new: formatTime(coNewTime),
                            co_location_old: data?.coLatlongOld || null,
                            co_location_new: coNewLocation ? `${coNewLocation.lat}, ${coNewLocation.lng}` : null,
                            co_address_old: data?.coAddressOld || null,
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
                            handleRequestError(error);
                        }
                    }}
                >
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '10px' }}>
                        วันที่ {data?.attDate ? moment(data.attDate).format("DD/MM/YYYY") : "-"}
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        {/* Check-In Card */}
                        <Card className="mb-3" style={{ border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden', width: '50%', height: '50%' }}>
                            <Card.Header style={{ backgroundColor: '#A0BDFF', fontWeight: 'bold', borderBottom: '1px solid #d9d9d9' }}>
                                เวลาเข้า
                            </Card.Header>
                            <Card.Body className="p-3">
                                {renderTimeSection('ci', data?.ciTimeOld, data?.ciCorrectTime, ciNewTime, setCiNewTime)}
                                {(data?.ciCorrectZone === 'นอกสถานที่' || (isReadOnly && (data?.ciLatlongNew || data?.ciAddressNew))) ? (
                                    renderMapSection('ci', data?.ciLatlongOld, data?.ciCorrectZone, ciNewLocation, setCiNewLocation, data?.ciAddressOld, ciNewAddress)
                                ) : (
                                    <div style={{ display: 'flex', marginBottom: '10px' }}>
                                        <div style={{ width: '80px', fontWeight: 'bold' }}>ตำแหน่ง</div>
                                        <div style={{ flex: 1 }}>{data?.ciAddressOld || "-"}</div>
                                    </div>
                                )}
                                <div style={{ display: 'flex', marginBottom: '0', paddingTop: '10px' }}>
                                    <div style={{ width: '80px', fontWeight: 'bold' }}>เหตุผล</div>
                                    <div style={{ flex: 1 }}>{data?.ciReason || "-"}</div>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Check-Out Card */}
                        <Card className="mb-3" style={{ border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden', width: '50%', height: '50%' }}>
                            <Card.Header style={{ backgroundColor: '#A0BDFF', fontWeight: 'bold', borderBottom: '1px solid #d9d9d9' }}>
                                เวลาออก
                            </Card.Header>
                            <Card.Body className="p-3">
                                {renderTimeSection('co', data?.coTimeOld, data?.coCorrectTime, coNewTime, setCoNewTime)}
                                {(data?.coCorrectZone === 'นอกสถานที่' || (isReadOnly && (data?.coLatlongNew || data?.coAddressNew))) ? (
                                    renderMapSection('co', data?.coLatlongOld, data?.coCorrectZone, coNewLocation, setCoNewLocation, data?.coAddressOld, coNewAddress)
                                ) : (
                                    <div style={{ display: 'flex', marginBottom: '10px' }}>
                                        <div style={{ width: '80px', fontWeight: 'bold' }}>ตำแหน่ง</div>
                                        <div style={{ flex: 1 }}>{data?.coAddressOld || "-"}</div>
                                    </div>
                                )}
                                <div style={{ display: 'flex', marginBottom: '0', paddingTop: '10px' }}>
                                    <div style={{ width: '80px', fontWeight: 'bold' }}>เหตุผล</div>
                                    <div style={{ flex: 1 }}>{data?.coReason || "-"}</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>

                    {/* Reason Display */}
                    {(data?.requestReason || data?.rejectReason) && isReadOnly && (
                        <div style={{ marginBottom: '15px', padding: '0 5px' }}>
                            {data?.requestReason && (
                                <div style={{ display: 'flex', marginBottom: '8px' }}>
                                    <div style={{ width: '120px', fontWeight: 'bold' }}>เหตุผลคำขอ :</div>
                                    <div style={{ flex: 1 }}>{data.requestReason}</div>
                                </div>
                            )}

                            {data?.rejectReason && (
                                <div style={{ display: 'flex' }}>
                                    <div style={{ width: '120px', fontWeight: 'bold' }}>เหตุผลที่ปฏิเสธ :</div>
                                    <div style={{ flex: 1 }}>{data.rejectReason}</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Request Reason Card */}
                    {!isReadOnly && (
                        <Card className="mb-3" style={{ border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
                            <Card.Header style={{ backgroundColor: '#A0BDFF', fontWeight: 'bold', borderBottom: '1px solid #d9d9d9' }}>
                                <span style={{ color: 'red', marginRight: '5px' }}>*</span>เหตุผลคำขอ
                            </Card.Header>
                            <Card.Body className="p-3" style={{ paddingBottom: '0 !important' }}>
                                <Form.Item shouldUpdate noStyle>
                                    {() => {
                                        const err = form.getFieldError("requestReason")?.[0];
                                        return (
                                            <Form.Item
                                                name="requestReason"
                                                style={{ marginBottom: 0 }}
                                                rules={[{ required: true, message: 'เหตุผลคำขอ' }]}
                                                validateStatus={err ? "error" : undefined}
                                                help={fixedHelp(err)}
                                            >
                                                <Input.TextArea rows={4} placeholder="ระบุเหตุผลที่ขอแก้ไข..." style={{ resize: 'none' }} />
                                            </Form.Item>
                                        );
                                    }}
                                </Form.Item>
                            </Card.Body>
                        </Card>
                    )}

                    <div className="modal-footer justify-content-center border-top-0 pb-0 pt-3" style={{ gap: '20px' }}>
                        {!isReadOnly && (
                            <>
                                <SubmitModalBtnBootstrap
                                    onClick={() => form.submit()}
                                >
                                </SubmitModalBtnBootstrap>

                                <div style={{ width: '30px' }}></div>
                            </>
                        )}

                        <CloseModalBtnBootstrap
                            onClick={onClose}
                        >
                        </CloseModalBtnBootstrap>
                    </div>
                </Form>
            </div>
        </Modal >
    );
};

const AttendanceLeaveMange = ({ title }) => {
    const navigate = useNavigate();

    const handleRequestError = (error) => {
        if (error.response) {
            const status = error.response.status;
            if (status === 401) {
                TokenService.deleteUser();
                navigate("/signin", { state: { message: "please sign-in again." } });
                return true;
            }
            if (error.response.data && error.response.data.message) {
                noticeShowMessage(error.response.data.message, true);
                return false;
            }
            if (status === 403) {
                TokenService.deleteUser();
                navigate("/signin", { state: { message: "access-denied" } });
                return true;
            }
            if (status === 404) {
                navigate("/signin", { state: { message: "not-found" } });
                return true;
            }

        } else if (error.request) {
            console.log("No response received:", error.request);
            return navigate("/signin", { state: { message: "network-error" } });

        } else {
            console.log("Error setting up request:", error.message);
            return navigate("/signin", { state: { message: "error" } });
        }
        return false;
    };

    // Attendance Change State
    const [attStartDate, setAttStartDate] = useState(null);
    const [attEndDate, setAttEndDate] = useState(null);
    const [attStatus, setAttStatus] = useState("ทั้งหมด");

    const [openAttStatusDropdown, setOpenAttStatusDropdown] = useState(false);
    const attFilterRef = useRef(null);

    const handleAttKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setOpenAttStatusDropdown(false);
            handleAttSearch();
        }
    };
    const [attStatusList, setAttStatusList] = useState([]);
    const [attChangeData, setAttChangeData] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editModalData, setEditModalData] = useState(null);
    const [isEditModalReadOnly, setIsEditModalReadOnly] = useState(false);
    const [isRejectReasonModalOpen, setIsRejectReasonModalOpen] = useState(false);
    const [rejectReasonText, setRejectReasonText] = useState("");
    const [isDeleteAttModalOpen, setIsDeleteAttModalOpen] = useState(false);
    const [attToDelete, setAttToDelete] = useState(null);
    const [isViewReasonModalOpen, setIsViewReasonModalOpen] = useState(false);
    const [viewReasonData, setViewReasonData] = useState(null);

    // Leave Request State
    const [leaveStartDate, setLeaveStartDate] = useState(null);
    const [leaveEndDate, setLeaveEndDate] = useState(null);
    const [leaveStatus, setLeaveStatus] = useState("ทั้งหมด");

    const [openLeaveStatusDropdown, setOpenLeaveStatusDropdown] = useState(false);
    const leaveFilterRef = useRef(null);

    const handleLeaveKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setOpenLeaveStatusDropdown(false);
            handleLeaveSearch();
        }
    };

    // Leave Modal State
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [isDeleteLeaveModalOpen, setIsDeleteLeaveModalOpen] = useState(false);
    const [leaveToDelete, setLeaveToDelete] = useState(null);
    const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
    const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
    const [leaveForm, setLeaveForm] = useState({ id: null, type_leave: null, startDate: null, endDate: null, startTime: null, endTime: null, reason: "", isFullDay: true });
    const [leaveFormErrors, setLeaveFormErrors] = useState({ type_leave: "", startDate: "", endDate: "", time: "", reason: "" });

    const [leaveStatusList, setLeaveStatusList] = useState([]);
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [holidays, setHolidays] = useState([]);
    const [workTimeLimits, setWorkTimeLimits] = useState({ startH: 8, startM: 30, endH: 17, endM: 0 });
    const [geofence, setGeofence] = useState(null);

    useEffect(() => {
        document.title = Title.get_title(title);
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

                const leaveTypeResponse = await getDropdown.get_dropdown({ type: 'TypeLeave' });
                if (leaveTypeResponse.data) {
                    setLeaveTypeOptions(leaveTypeResponse.data);
                }

                // Fetch Attendance Change
                const attChangeResponse = await getAttChange.get_att_change();
                if (attChangeResponse.data) {
                    setAttChangeData(attChangeResponse.data);
                    setOriginalData(attChangeResponse.data);
                }

                // Fetch Holidays for current and next year to cover future leave requests
                const currentYear = moment().year();
                try {
                    const [holidaysRes1, holidaysRes2] = await Promise.all([
                        getLeaveHoliday.GetLeaveHoliday({ is_active: 1, yearSearch: currentYear }),
                        getLeaveHoliday.GetLeaveHoliday({ is_active: 1, yearSearch: currentYear + 1 })
                    ]);

                    let combinedHolidays = [];
                    if (holidaysRes1.data) combinedHolidays = [...combinedHolidays, ...holidaysRes1.data];
                    if (holidaysRes2.data) combinedHolidays = [...combinedHolidays, ...holidaysRes2.data];
                    setHolidays(combinedHolidays);
                } catch (error) {
                    console.error("Error fetching holidays:", error);
                    handleRequestError(error);
                }

                // Fetch Leave Data
                await fetchLeaveData();

                // Fetch Button Status (Time Limits & Geofence)
                try {
                    const btnRes = await getButton.get_button();
                    if (btnRes.data) {
                        const { ciThreshold, coThreshold, wpCondition } = btnRes.data;
                        let startH = 8, startM = 30, endH = 17, endM = 0;
                        if (ciThreshold) {
                            const [h, m] = ciThreshold.split(':');
                            startH = parseInt(h, 10);
                            startM = parseInt(m, 10);
                        }
                        if (coThreshold) {
                            const [h, m] = coThreshold.split(':');
                            endH = parseInt(h, 10);
                            endM = parseInt(m, 10);
                        }
                        setWorkTimeLimits({ startH, startM, endH, endM });

                        if (wpCondition) {
                            const parts = wpCondition.split(',').map(part => parseFloat(part.trim()));
                            if (parts.length === 3 && !parts.some(isNaN)) {
                                setGeofence({ lat: parts[0], lng: parts[1], radius: parts[2] });
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error fetching button status:", error);
                    handleRequestError(error);
                }

            } catch (error) {
                console.error("Error fetching initial data:", error);
                handleRequestError(error);
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
                        let parts = [];
                        const days = item.total_day ? parseInt(item.total_day, 10) : 0;
                        if (days > 0) {
                            parts.push(`${days} วัน`);
                        }

                        if (item.working_hour && item.working_hour !== "00:00:00") {
                            const timeParts = item.working_hour.split(':');
                            if (timeParts.length >= 2) {
                                const h = parseInt(timeParts[0], 10);
                                const m = parseInt(timeParts[1], 10);
                                if (h > 0) parts.push(`${h} ชั่วโมง`);
                                if (m > 0) parts.push(`${m} นาที`);
                            }
                        }

                        let durationDisplay = parts.length > 0 ? parts.join(' ') : '-';

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
            handleRequestError(error);
            setLeaveHistory([]);
        }
    };

    // --- Attendance Change Handlers ---
    const handleAttSearch = async () => {
        // if (attEndDate && !attStartDate) {
        //     noticeShowMessage("กรุณากรอกวันที่เริ่มต้น", true);
        //     return;
        // }

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
            handleRequestError(error);
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
        // if (leaveEndDate && !leaveStartDate) {
        //     noticeShowMessage("กรุณากรอกวันที่เริ่มต้น", true);
        //     return;
        // }

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
            handleRequestError(error);
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

    // --- Leave Modal Handlers ---
    const openLeaveModal = () => {
        setModalMode("add");
        setLeaveForm({ id: null, type_leave: null, startDate: null, endDate: null, startTime: null, endTime: null, reason: "", original_reason: "", reject_reason: "", isFullDay: true });
        setLeaveFormErrors({ type_leave: "", startDate: "", endDate: "", time: "", reason: "" });
        setShowLeaveModal(true);
    };

    const openEditLeaveModal = (record) => {
        setModalMode("edit");
        const isFullDayStr = record.start_time ? record.start_time.includes("00:00:00") && record.end_time?.includes("00:00:00") : false;
        const isFullDay = (!record.start_time && !record.end_time) || isFullDayStr;
        setLeaveForm({
            id: record.leave_id || record.id || record.key, type_leave: record.type_leave,
            startDate: record.start_date ? moment(record.start_date) : null,
            endDate: record.end_date ? moment(record.end_date) : null,
            startTime: record.start_time && !isFullDayStr ? moment(record.start_time) : null,
            endTime: record.end_time && !isFullDayStr ? moment(record.end_time) : null,
            reason: "", original_reason: record.reason || "", reject_reason: record.reject_reason || "", isFullDay: isFullDay
        });
        setLeaveFormErrors({ type_leave: "", startDate: "", endDate: "", time: "", reason: "" });
        setShowLeaveModal(true);
    };

    const closeLeaveModal = () => {
        setShowLeaveModal(false);
        setLeaveFormErrors({ type_leave: "", startDate: "", endDate: "", time: "", reason: "" });
    };

    const checkDuplicateDate = (start, end, excludeId = null) => {
        if (!start || !end) return false;
        const startStr = typeof start.format === 'function' ? start.format('YYYY-MM-DD') : null;
        const endStr = typeof end.format === 'function' ? end.format('YYYY-MM-DD') : null;
        if (!startStr || !endStr) return false;
        const startClone = moment(startStr, 'YYYY-MM-DD').startOf('day');
        const endClone = moment(endStr, 'YYYY-MM-DD').startOf('day');

        return leaveHistory.some(item => {
            if (excludeId && (item.leave_id === excludeId || item.id === excludeId || item.key === excludeId)) return false;
            if (item.status_request === 'Rejected' || item.status_request === 'Rj') return false;
            if (!item.start_date || !item.end_date) return false;
            const itemStart = moment(item.start_date).startOf('day');
            const itemEnd = moment(item.end_date).startOf('day');
            return (startClone.isSameOrBefore(itemEnd) && endClone.isSameOrAfter(itemStart));
        });
    };

    const handleSaveLeave = async () => {
        let hasError = false;
        let errors = { type_leave: "", startDate: "", endDate: "", time: "", reason: "" };

        if (modalMode === "add" && !leaveForm.type_leave) { errors.type_leave = "เลือกประเภทการลา"; hasError = true; }
        if (!leaveForm.startDate || !leaveForm.endDate) {
            if (!leaveForm.startDate) errors.startDate = "เลือกวันที่เริ่มต้น";
            if (!leaveForm.endDate) errors.endDate = "เลือกวันที่สิ้นสุด";
            hasError = true;
        } else if (checkDuplicateDate(leaveForm.startDate, leaveForm.endDate, leaveForm.id)) {
            errors.startDate = "วันลานี้มีการลางานแล้ว (ซ้ำ)"; errors.endDate = "วันลานี้มีการลางานแล้ว (ซ้ำ)"; hasError = true;
        }

        if (!leaveForm.isFullDay) {
            if (!leaveForm.startTime || !leaveForm.endTime) { errors.time = "ระบุช่วงเวลา"; hasError = true; }
            else if (leaveForm.startDate && leaveForm.endDate && leaveForm.startDate.isSame(leaveForm.endDate, 'day')) {
                const st = moment(typeof leaveForm.startTime.format === 'function' ? leaveForm.startTime.format("HH:mm") : leaveForm.startTime, "HH:mm");
                const et = moment(typeof leaveForm.endTime.format === 'function' ? leaveForm.endTime.format("HH:mm") : leaveForm.endTime, "HH:mm");
                if (st.isSameOrAfter(et)) { errors.time = "เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด"; hasError = true; }
            }
        }

        if (!leaveForm.reason || !leaveForm.reason.trim()) { errors.reason = "ระบุเหตุผล"; hasError = true; }
        setLeaveFormErrors(errors);
        if (hasError) return;

        setLoading(true);
        try {
            const user = TokenService.getUser();
            const payload = {
                oa_user: user?.profile?.oa_user, type_leave: leaveForm.type_leave,
                start_date: leaveForm.startDate.format("YYYY-MM-DD"), end_date: leaveForm.endDate.format("YYYY-MM-DD"),
                start_time: !leaveForm.isFullDay && leaveForm.startTime ? leaveForm.startDate.format("YYYY-MM-DD") + "T" + leaveForm.startTime.format("HH:mm:ss") : null,
                end_time: !leaveForm.isFullDay && leaveForm.endTime ? leaveForm.endDate.format("YYYY-MM-DD") + "T" + leaveForm.endTime.format("HH:mm:ss") : null,
                reason: leaveForm.reason
            };

            const response = await postLeave.post_leave(payload);

            if (response.data && response.data.message === "Success") {
                noticeShowMessage("บันทึกข้อมูลสำเร็จ", false);
                setShowLeaveModal(false);
                fetchLeaveData();
            } else {
                noticeShowMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล", true);
            }
        } catch (error) {
            console.error("Error saving leave:", error);
            handleRequestError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLeave = (record) => {
        setLeaveToDelete(record);
        setIsDeleteLeaveModalOpen(true);
    };

    const confirmDeleteLeave = async () => {
        if (!leaveToDelete) return;
        try {
            setLoading(true);
            const payload = {
                start_date: leaveToDelete.start_date ? moment(leaveToDelete.start_date).format('YYYY-MM-DD') : null,
                end_date: leaveToDelete.end_date ? moment(leaveToDelete.end_date).format('YYYY-MM-DD') : null
            };
            const response = await deleteLeave.delete_leave(payload);
            if (response.status === 200) {
                noticeShowMessage("ลบข้อมูลสำเร็จ", true);
                setIsDeleteLeaveModalOpen(false);
                setLeaveToDelete(null);
                fetchLeaveData();
            } else {
                noticeShowMessage("เกิดข้อผิดพลาดในการลบข้อมูล", true);
            }
        } catch (error) {
            console.error("Error deleting leave:", error);
            handleRequestError(error);
        } finally {
            setLoading(false);
        }
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
                    setIsEditModalReadOnly(false);
                    setIsEditModalOpen(true);
                } else {
                    noticeShowMessage("ไม่พบข้อมูลรายละเอียด", true);
                }
            } else {
                noticeShowMessage("ไม่พบข้อมูลรายละเอียด", true);
            }
        } catch (error) {
            console.error("Error fetching modal data:", error);
            handleRequestError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewApprovedAtt = async (record) => {
        setLoading(true);
        console.log("Viewing Record:", record);
        try {
            const response = await getModalAttChange.get_modal_att_change({ Date: record.attDate });
            console.log("API Response:", response);

            if (response.data) {
                let modalData = response.data;
                if (Array.isArray(modalData)) {
                    modalData = modalData.length > 0 ? modalData[0] : null;
                }
                if (modalData) {
                    modalData.rejectReason = modalData.rejectReason || record.rejectReason;
                    modalData.requestReason = modalData.requestReason || record.requestReason;
                    console.log("Setting View Data:", modalData);
                    setEditModalData(modalData);
                    setIsEditModalReadOnly(true);
                    setIsEditModalOpen(true);
                } else {
                    noticeShowMessage("ไม่พบข้อมูลรายละเอียด", true);
                }
            } else {
                noticeShowMessage("ไม่พบข้อมูลรายละเอียด", true);
            }
        } catch (error) {
            console.error("Error fetching view data:", error);
            handleRequestError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAtt = (record) => {
        setAttToDelete(record);
        setIsDeleteAttModalOpen(true);
    };

    const confirmDeleteAtt = async () => {
        if (!attToDelete) return;
        setLoading(true);
        try {
            const response = await deleteAttChange.delete_att_change({ Date: attToDelete.attDate });
            if (response.data || response.status === 200) {
                noticeShowMessage("ลบข้อมูลสำเร็จ", true);
                setIsDeleteAttModalOpen(false);
                setAttToDelete(null);
                handleAttSearch();
            } else {
                noticeShowMessage("เกิดข้อผิดพลาดในการลบข้อมูล", true);
            }
        } catch (error) {
            console.error("Error deleting attendance change:", error);
            handleRequestError(error);
        } finally {
            setLoading(false);
        }
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
            render: (text, record) => {
                if (!text) return "-";
                const parts = text.includes('-') ? text.split('-') : text.split('/');
                let formattedDate = text;
                if (parts.length === 3) {
                    formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
                }

                const statusStr = String(record.changeStatusCode ?? record.changeStatus ?? "").trim();
                if (statusStr === 'Ap' || statusStr === 'PA') {
                    return (
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handleViewApprovedAtt(record);
                            }}
                            style={{ color: '#1890ff', textDecoration: 'underline' }}
                        >
                            {formattedDate}
                        </a>
                    );
                }

                return formattedDate;
            }
        },
        {
            title: 'เหตุผล',
            dataIndex: 'requestReason',
            key: 'requestReason',
            align: 'left',
            width: 150,
            sorter: (a, b) => String(a.requestReason ?? "").localeCompare(String(b.requestReason ?? "")),
            render: (text, record) => {
                const status = String(record.changeStatusCode ?? record.changeStatus ?? "").trim();
                if (record.action === 'delete' || status === 'Rj') {
                    return (
                        <div style={{ textAlign: "center" }}>
                            <i
                                className="bi bi-eye"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setViewReasonData(record);
                                    setIsViewReasonModalOpen(true);
                                }}
                                style={{ cursor: 'pointer', color: '#1890ff', fontSize: '18px' }}
                            ></i>
                        </div>
                    );
                }
                return (
                    <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                        {text && text.trim() ? text : "-"}
                    </div>
                );
            },
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
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "center" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    )
                },
                {
                    title: 'ตำแหน่ง',
                    dataIndex: 'ciLocation',
                    key: 'ciLocation',
                    align: 'left',
                    width: 120,
                    sorter: (a, b) => String(a.ciLocation ?? "").localeCompare(String(b.ciLocation ?? "")),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    )
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
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "center" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    )
                },
                {
                    title: 'ตำแหน่งที่ขอแก้ไข',
                    dataIndex: 'ciLocationNew',
                    key: 'ciLocationNew',
                    align: 'left',
                    width: 120,
                    sorter: (a, b) => String(a.ciLocationNew ?? "").localeCompare(String(b.ciLocationNew ?? "")),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    )
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
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "center" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    )
                },
                {
                    title: 'ตำแหน่งที่ขอแก้ไข',
                    dataIndex: 'coLocationNew',
                    key: 'coLocationNew',
                    align: 'left',
                    width: 120,
                    sorter: (a, b) => String(a.coLocationNew ?? "").localeCompare(String(b.coLocationNew ?? "")),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    )
                }
            ]
        },
        {
            title: 'สถานะคำขอ',
            dataIndex: 'changeStatus',
            key: 'changeStatus',
            align: 'center',
            width: 120,
            sorter: (a, b) => String(a.changeStatusCode ?? a.changeStatus ?? "").localeCompare(String(b.changeStatusCode ?? b.changeStatus ?? "")),

            render: (text, record) => {
                const status = record.changeStatusCode ? String(record.changeStatusCode).trim() : (text ? String(text).trim() : "-");
                const label = record.changeStatus || status;
                switch (status) {
                    case 'Rj': return <RejectTag text={label} />;
                    case 'Ap': return <ApproveTag text={label} />;
                    case 'PA': return <PendingApproveTag text={label} />;
                    default: return label;
                }
            }
        }
    ];

    const leaveColumns = [
        {
            title: (
                <div style={{ textAlign: 'center' }}>
                    <AddToolBtnBootstrap onClick={openLeaveModal} />
                </div>
            ),
            key: 'action',
            render: (text, record) => {
                const availableActions = record.available_actions || '';

                return (
                    <div style={{ textAlign: 'center', display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        {availableActions.includes('EDIT') && (
                            <EditToolBtnBootstrap onClick={() => openEditLeaveModal(record)} />
                        )}
                        {availableActions.includes('DELETE') && (
                            <DeleteToolBtn onClick={() => handleDeleteLeave(record)} />
                        )}
                    </div>
                );
            },
            width: 100,
            align: 'center'
        },
        {
            title: 'ประเภทวันลา',
            dataIndex: 'type_leave',
            key: 'type_leave',
            align: 'center',
            width: 150,
            sorter: (a, b) => String(a.type_leave ?? "").localeCompare(String(b.type_leave ?? ""))
        },

        {
            title: 'วันที่เริ่มต้น',
            dataIndex: 'startDate',
            key: 'startDate',
            align: 'center',
            width: 120,
            sorter: (a, b) => {
                const dateA = moment(a.startDate, 'DD/MM/YYYY');
                const dateB = moment(b.startDate, 'DD/MM/YYYY');
                return dateA.diff(dateB);
            }
        },
        {
            title: 'วันที่สิ้นสุด',
            dataIndex: 'endDate',
            key: 'endDate',
            align: 'center',
            width: 120,
            sorter: (a, b) => {
                const dateA = moment(a.endDate, 'DD/MM/YYYY');
                const dateB = moment(b.endDate, 'DD/MM/YYYY');
                return dateA.diff(dateB);
            }
        },
        {
            title: 'ช่วงเวลา (น.)',
            dataIndex: 'timeRange',
            key: 'timeRange',
            align: 'center',
            width: 120,
            sorter: (a, b) => String(a.timeRange ?? "").localeCompare(String(b.timeRange ?? ""))
        },
        {
            title: 'ระยะเวลา',
            dataIndex: 'duration',
            key: 'duration',
            align: 'center',
            width: 120,
            sorter: (a, b) => String(a.duration ?? "").localeCompare(String(b.duration ?? ""))
        },
        {
            title: 'เหตุผล',
            dataIndex: 'reason',
            key: 'reason',
            width: 200,
            sorter: (a, b) => String(a.reason ?? "").localeCompare(String(b.reason ?? ""))
        },
        {
            title: 'เหตุผลที่ถูกปฏิเสธ',
            dataIndex: 'reject_reason',
            key: 'reject_reason',
            align: 'center',
            width: 200,
            sorter: (a, b) => String(a.reject_reason ?? "").localeCompare(String(b.reject_reason ?? "")),
            render: (text) => (
                <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                    {text && text.trim() ? text : "-"}
                </div>
            ),
        },
        {
            title: 'สถานะ',
            dataIndex: 'status_request',
            key: 'status_request',
            align: 'center',
            width: 120,
            sorter: (a, b) => String(a.status_request ?? "").localeCompare(String(b.status_request ?? "")),
            render: (text) => {
                const statusLabel = text ? String(text).trim() : "-";
                const matchedStatus = leaveStatusList.find(item => item.label === statusLabel);
                const statusCode = matchedStatus ? matchedStatus.value : statusLabel;

                switch (statusCode) {
                    case 'Rj': return <RejectTag text={statusLabel} />;
                    case 'Ap': return <ApproveTag text={statusLabel} />;
                    case 'PA': return <PendingApproveTag text={statusLabel} />;
                    default: return statusLabel;
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
                        ref={attFilterRef}
                        tabIndex={-1}
                        onKeyDown={handleAttKeyDown}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "15px",
                            background: "white",
                            outline: "none"
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: 700, fontSize: '16px' }}>วันที่:</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div style={{ position: 'relative', marginTop: '4px' }}>
                                    <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '11px', color: '#888', zIndex: 1 }}>Start Date</span>
                                    <DatePicker
                                        format="DD/MM/YYYY"
                                        placeholder="DD/MM/YYYY"
                                        inputReadOnly={true}
                                        value={attStartDate}
                                        onChange={(date) => {
                                            setAttStartDate(date);
                                            requestAnimationFrame(() => attFilterRef.current?.focus());
                                        }}
                                        disabledDate={(current) => {
                                            return attEndDate ? current && current > attEndDate.endOf('day') : false;
                                        }}
                                        style={{ width: 140 }}
                                    />
                                </div>
                                <span>-</span>
                                <div style={{ position: 'relative', marginTop: '4px' }}>
                                    <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '11px', color: '#888', zIndex: 1 }}>End Date</span>
                                    <DatePicker
                                        format="DD/MM/YYYY"
                                        placeholder="DD/MM/YYYY"
                                        inputReadOnly={true}
                                        value={attEndDate}
                                        onChange={(date) => {
                                            setAttEndDate(date);
                                            requestAnimationFrame(() => attFilterRef.current?.focus());
                                        }}
                                        disabledDate={(current) => {
                                            return attStartDate ? current && current < attStartDate.startOf('day') : false;
                                        }}
                                        style={{ width: 140 }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: 700, fontSize: '16px' }}>สถานะคำขอ:</span>
                            <Select
                                placeholder="-เลือก-"
                                value={attStatus}
                                open={openAttStatusDropdown}
                                onDropdownVisibleChange={(open) => setOpenAttStatusDropdown(open)}
                                onChange={(value) => {
                                    setAttStatus(value);
                                    requestAnimationFrame(() => attFilterRef.current?.focus());
                                }}
                                style={{ width: 150 }}
                            >
                                <Option value="ทั้งหมด">ทั้งหมด</Option>
                                {attStatusList.map((item) => (
                                    <Option key={item.value} value={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </div>

                        <div style={{ marginLeft: "auto", display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <SearchToolBtnBootstrap onClick={handleAttSearch} />
                            <ClearToolBtnBootstrap onClick={handleAttClear} />
                        </div>
                    </div>
                    <div style={{ marginTop: "5px", maxWidth: "100%", overflowX: "auto" }}>
                        <div style={{ minWidth: "1200px" }}>
                            <TableUI
                                columns={attColumns}
                                dataSource={attChangeData}
                                pagination={true}
                                bordered={true}
                                size="small"
                                rowKey={(record, index) => index}
                            />
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <EditAttModal
                show={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                data={editModalData}
                onSuccess={handleAttSearch}
                geofence={geofence}
                isReadOnly={isEditModalReadOnly}
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
                        ref={leaveFilterRef}
                        tabIndex={-1}
                        onKeyDown={handleLeaveKeyDown}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "15px",
                            background: "white",
                            outline: "none"
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: 700, fontSize: '16px' }}>วันที่:</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div style={{ position: 'relative', marginTop: '4px' }}>
                                    <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '11px', color: '#888', zIndex: 1 }}>Start Date</span>
                                    <DatePicker
                                        format="DD/MM/YYYY"
                                        placeholder="DD/MM/YYYY"
                                        inputReadOnly={true}
                                        value={leaveStartDate}
                                        onChange={(date) => {
                                            setLeaveStartDate(date);
                                            requestAnimationFrame(() => leaveFilterRef.current?.focus());
                                        }}
                                        disabledDate={(current) => leaveEndDate ? current && current.isAfter(leaveEndDate, 'day') : false}
                                        style={{ width: 140 }}
                                    />
                                </div>
                                <span>-</span>
                                <div style={{ position: 'relative', marginTop: '4px' }}>
                                    <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '11px', color: '#888', zIndex: 1 }}>End Date</span>
                                    <DatePicker
                                        format="DD/MM/YYYY"
                                        placeholder="DD/MM/YYYY"
                                        inputReadOnly={true}
                                        value={leaveEndDate}
                                        onChange={(date) => {
                                            setLeaveEndDate(date);
                                            requestAnimationFrame(() => leaveFilterRef.current?.focus());
                                        }}
                                        disabledDate={(current) => leaveStartDate ? current && current.isBefore(leaveStartDate, 'day') : false}
                                        style={{ width: 140 }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Form component={false}>
                                <Form.Item label={<span style={{ fontWeight: 700, fontSize: '16px' }}>สถานะคำขอ</span>} style={{ marginBottom: 0 }}>
                                    <Select
                                        placeholder="-เลือก-"
                                        value={leaveStatus}
                                        open={openLeaveStatusDropdown}
                                        onDropdownVisibleChange={(open) => setOpenLeaveStatusDropdown(open)}
                                        onChange={(value) => {
                                            setLeaveStatus(value);
                                            requestAnimationFrame(() => leaveFilterRef.current?.focus());
                                        }}
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
                    <div style={{ marginTop: "5px", maxWidth: "100%", overflowX: "auto" }}>
                        <div style={{ minWidth: "1200px" }}>
                            <TableUI
                                columns={leaveColumns}
                                dataSource={leaveHistory}
                                pagination={false}
                                bordered={true}
                                size="small"
                                loading={loading}
                            />
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <Modal
                title={
                    <div style={{ backgroundColor: '#2750B0', color: 'white', padding: '16px 24px', margin: '-20px -24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '18px', fontWeight: '600', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                        <span>{modalMode === 'add' ? 'Add' : 'Edit'} - Leave</span>
                        <i className="bi bi-x-lg" onClick={closeLeaveModal} style={{ cursor: "pointer", fontSize: "20px" }}></i>
                    </div>
                }
                open={showLeaveModal} onCancel={closeLeaveModal} closable={false} width={750} centered
                styles={{ header: { padding: 0, borderBottom: 'none' }, body: { padding: '24px' }, content: { padding: 0, overflow: 'hidden', borderRadius: '8px' }, mask: { backgroundColor: 'rgba(0, 0, 0, 0.5)' } }}
                footer={[
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', paddingBottom: '20px' }} key="footer">
                        <Button key="submit" onClick={handleSaveLeave} style={{ backgroundColor: '#A0BDFF', borderColor: '#A0BDFF', color: 'black', fontWeight: 'bold', borderRadius: '8px', height: '40px', minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                            <i className="bi bi-file-earmark-check-fill" style={{ fontSize: '1.2em' }}></i> Submit
                        </Button>
                        <Button key="close" onClick={closeLeaveModal} style={{ backgroundColor: '#d9d9d9', borderColor: '#d9d9d9', color: 'black', fontWeight: 'bold', borderRadius: '8px', height: '40px', minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                            <i className="bi bi-x-lg" style={{ fontSize: '1.2em' }}></i> Close
                        </Button>
                    </div>
                ]}
            >
                <div
                    style={{ display: 'flex', flexDirection: 'column', gap: '25px', fontSize: '16px' }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSaveLeave();
                        }
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <span style={{ width: '130px', fontWeight: 'bold', marginTop: modalMode === 'add' ? '10px' : '0' }}>{modalMode === 'add' && <span style={{ color: 'red', marginRight: '5px' }}>*</span>}ประเภทการลา</span>
                        {modalMode === 'add' ? (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Select placeholder="-เลือก-" style={{ width: 250, height: '40px', ...(leaveFormErrors.type_leave ? { border: '1px solid #ff4d4f', borderRadius: '6px' } : {}) }} status={leaveFormErrors.type_leave ? "error" : ""} value={leaveForm.type_leave} onChange={(v) => { setLeaveForm({ ...leaveForm, type_leave: v }); setLeaveFormErrors({ ...leaveFormErrors, type_leave: "" }); }}>
                                    <Option value="">-เลือก-</Option>
                                    {leaveTypeOptions.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
                                </Select>
                                {leaveFormErrors.type_leave && <span style={{ color: '#ff4d4f', fontSize: '14px', marginTop: '5px' }}>{leaveFormErrors.type_leave}</span>}
                            </div>
                        ) : (<span>{leaveForm.type_leave || '-'}</span>)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <span style={{ width: '130px', fontWeight: 'bold', marginTop: modalMode === 'add' ? '10px' : '0' }}>{modalMode === 'add' && <span style={{ color: 'red', marginRight: '5px' }}>*</span>}วันที่</span>
                        {modalMode === 'add' ? (
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', top: '-10px', left: '10px', fontSize: '12px', backgroundColor: 'white', padding: '0 5px', color: leaveFormErrors.startDate ? '#ff4d4f' : '#666', zIndex: 1 }}>start</span>
                                        <DatePicker
                                            format="DD/MM/YYYY"
                                            placeholder="DD/MM/YYYY"
                                            status={leaveFormErrors.startDate ? "error" : ""}
                                            value={leaveForm.startDate}
                                            suffixIcon={<i className="bi bi-calendar"></i>}
                                            onChange={(date) => {
                                                const isDifferentDay = date && leaveForm.endDate && !date.isSame(leaveForm.endDate, 'day');
                                                setLeaveForm({
                                                    ...leaveForm,
                                                    startDate: date,
                                                    ...(isDifferentDay && { isFullDay: true, startTime: null, endTime: null })
                                                });
                                                let errs = { ...leaveFormErrors, startDate: "", endDate: "" };
                                                if (checkDuplicateDate(date, leaveForm.endDate, leaveForm.id)) {
                                                    errs.startDate = "วันลานี้มีการลางานแล้ว (ซ้ำ)";
                                                    errs.endDate = "วันลานี้มีการลางานแล้ว (ซ้ำ)";
                                                }
                                                setLeaveFormErrors(errs);
                                            }}
                                            disabledDate={(current) => {
                                                if (!current) return false;
                                                const minDate = moment().subtract(7, 'days').startOf('day');
                                                const maxDate = moment().add(365, 'days').endOf('day');
                                                const isOutOfRange = current.isBefore(minDate) || current.isAfter(maxDate);
                                                const isAfterEndDate = leaveForm.endDate ? current.isAfter(leaveForm.endDate, 'day') : false;

                                                const isWeekend = current.day() === 0 || current.day() === 6;
                                                const formattedCurrent = current.format('YYYY-MM-DD');
                                                const isHoliday = holidays.some(h => h.holidayDate && moment(h.holidayDate).format('YYYY-MM-DD') === formattedCurrent);

                                                return isOutOfRange || isAfterEndDate || isWeekend || isHoliday;
                                            }}
                                            style={{ width: 180, height: '40px', borderRadius: '6px', border: leaveFormErrors.startDate ? '1px solid #ff4d4f' : '1px solid #888' }}
                                        />
                                    </div>
                                    {leaveFormErrors.startDate && <span style={{ color: '#ff4d4f', fontSize: '14px', marginTop: '5px' }}>{leaveFormErrors.startDate}</span>}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', top: '-10px', left: '10px', fontSize: '12px', backgroundColor: 'white', padding: '0 5px', color: leaveFormErrors.endDate ? '#ff4d4f' : '#666', zIndex: 1 }}>End</span>
                                        <DatePicker
                                            format="DD/MM/YYYY"
                                            placeholder="DD/MM/YYYY"
                                            status={leaveFormErrors.endDate ? "error" : ""}
                                            value={leaveForm.endDate}
                                            suffixIcon={<i className="bi bi-calendar"></i>}
                                            onChange={(date) => {
                                                const isDifferentDay = leaveForm.startDate && date && !leaveForm.startDate.isSame(date, 'day');
                                                setLeaveForm({
                                                    ...leaveForm,
                                                    endDate: date,
                                                    ...(isDifferentDay && { isFullDay: true, startTime: null, endTime: null })
                                                });
                                                let errs = { ...leaveFormErrors, startDate: "", endDate: "" };
                                                if (checkDuplicateDate(leaveForm.startDate, date, leaveForm.id)) {
                                                    errs.startDate = "วันลานี้มีการลางานแล้ว (ซ้ำ)";
                                                    errs.endDate = "วันลานี้มีการลางานแล้ว (ซ้ำ)";
                                                }
                                                setLeaveFormErrors(errs);
                                            }}
                                            disabledDate={(current) => {
                                                if (!current) return false;
                                                const minDate = moment().subtract(7, 'days').startOf('day');
                                                const maxDate = moment().add(365, 'days').endOf('day');
                                                const isOutOfRange = current.isBefore(minDate) || current.isAfter(maxDate);
                                                const isBeforeStartDate = leaveForm.startDate ? current.isBefore(leaveForm.startDate, 'day') : false;

                                                const isWeekend = current.day() === 0 || current.day() === 6;
                                                const formattedCurrent = current.format('YYYY-MM-DD');
                                                const isHoliday = holidays.some(h => h.holidayDate && moment(h.holidayDate).format('YYYY-MM-DD') === formattedCurrent);

                                                return isOutOfRange || isBeforeStartDate || isWeekend || isHoliday;
                                            }}
                                            style={{ width: 180, height: '40px', borderRadius: '6px', border: leaveFormErrors.endDate ? '1px solid #ff4d4f' : '1px solid #888' }}
                                        />
                                    </div>
                                    {leaveFormErrors.endDate && <span style={{ color: '#ff4d4f', fontSize: '14px', marginTop: '5px' }}>{leaveFormErrors.endDate}</span>}
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <span>{leaveForm.startDate ? leaveForm.startDate.format('DD/MM/YYYY') : '-'}</span>
                                <span style={{ fontWeight: 'bold' }}>-</span>
                                <span>{leaveForm.endDate ? leaveForm.endDate.format('DD/MM/YYYY') : '-'}</span>
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <span style={{ width: '130px', fontWeight: 'bold', marginTop: '10px' }}><span style={{ color: 'red', marginRight: '5px' }}>*</span>ช่วงเวลา</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <Checkbox
                                    checked={leaveForm.isFullDay}
                                    onChange={() => { setLeaveForm({ ...leaveForm, isFullDay: true }); setLeaveFormErrors({ ...leaveFormErrors, time: "" }); }}
                                >ทั้งวัน</Checkbox>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Checkbox
                                        disabled={leaveForm.startDate && leaveForm.endDate && !leaveForm.startDate.isSame(leaveForm.endDate, 'day')}
                                        checked={!leaveForm.isFullDay}
                                        onChange={() => setLeaveForm({ ...leaveForm, isFullDay: false })}
                                    />
                                    <div style={{ position: 'relative', opacity: leaveForm.isFullDay ? 0.6 : 1 }}>
                                        <span style={{ position: 'absolute', top: '-10px', left: '10px', fontSize: '12px', backgroundColor: 'white', padding: '0 5px', color: leaveFormErrors.time ? '#ff4d4f' : '#666', zIndex: 1 }}>Start</span>
                                        <div style={{ display: 'flex', alignItems: 'center', border: leaveFormErrors.time ? '1px solid #ff4d4f' : '1px solid #888', borderRadius: '6px', paddingRight: '10px', height: '40px' }}>
                                            {/*
                                            <TimePicker
                                                disabled={leaveForm.isFullDay}
                                                format="HH:mm"
                                                placeholder="08:30"
                                                value={leaveForm.startTime}
                                                status={leaveFormErrors.time ? "error" : ""}
                                                hideDisabledOptions={true}
                                                disabledTime={() => {
                                                    const { endTime } = leaveForm;
                                                    const { startH: workStartH, startM: workStartM, endH: workEndH, endM: workEndM } = workTimeLimits;
                                                    return {
                                                        disabledHours: () => {
                                                            const hours = [];
                                                            for (let i = 0; i < 24; i++) {
                                                                if (i < workStartH || i > workEndH) hours.push(i);
                                                                else if (endTime && i > endTime.hour()) hours.push(i);
                                                            }
                                                            return hours;
                                                        },
                                                        disabledMinutes: (sH) => {
                                                            const mins = [];
                                                            for (let m = 0; m < 60; m++) {
                                                                if (sH === workStartH && m < workStartM) mins.push(m);
                                                                else if (sH === workEndH && m > workEndM) mins.push(m);
                                                                else if (endTime && sH === endTime.hour() && m >= endTime.minute()) mins.push(m);
                                                            }
                                                            return mins;
                                                        }
                                                    };
                                                }}
                                                onChange={(time) => {
                                                    const isSameDay = leaveForm.startDate?.isSame(leaveForm.endDate, 'day');
                                                    const endInv = isSameDay && leaveForm.endTime && time && (time.hour() * 60 + time.minute() >= leaveForm.endTime.hour() * 60 + leaveForm.endTime.minute());
                                                    setLeaveForm({ ...leaveForm, startTime: time, ...(endInv && { endTime: null }) });
                                                    setLeaveFormErrors({ ...leaveFormErrors, time: "" });
                                                }}
                                                style={{ width: 100, border: 'none', boxShadow: 'none' }}
                                                suffixIcon={<i className="bi bi-clock"></i>}
                                            />
                                            */}
                                            <TimePickerBootstrap
                                                disabled={leaveForm.isFullDay}
                                                step={30}
                                                format={24}
                                                start={`${String(workTimeLimits.startH).padStart(2, '0')}:${String(workTimeLimits.startM).padStart(2, '0')}`}
                                                end={leaveForm.endTime ? leaveForm.endTime.format('HH:mm') : `${String(workTimeLimits.endH).padStart(2, '0')}:${String(workTimeLimits.endM).padStart(2, '0')}`}
                                                value={leaveForm.startTime ? leaveForm.startTime.format('HH:mm') : null}
                                                onChange={(timeInt) => {
                                                    if (timeInt || timeInt === 0) {
                                                        const h = Math.floor(timeInt / 3600);
                                                        const m = Math.floor((timeInt % 3600) / 60);
                                                        const timeObj = moment().hour(h).minute(m).second(0);
                                                        const isSameDay = leaveForm.startDate?.isSame(leaveForm.endDate, 'day');
                                                        const endInv = isSameDay && leaveForm.endTime && (h * 60 + m >= leaveForm.endTime.hour() * 60 + leaveForm.endTime.minute());
                                                        setLeaveForm({ ...leaveForm, startTime: timeObj, ...(endInv && { endTime: null }) });
                                                        setLeaveFormErrors({ ...leaveFormErrors, time: "" });
                                                    } else {
                                                        setLeaveForm({ ...leaveForm, startTime: null });
                                                    }
                                                }}
                                                className="form-select border-0 shadow-none"
                                                style={{ width: 100, border: 'none', boxShadow: 'none', height: '100%', backgroundColor: 'transparent', padding: '0 8px' }}
                                            />
                                            <span style={{ fontWeight: 500 }}>น.</span>
                                        </div>
                                    </div>
                                    <span style={{ fontWeight: 'bold' }}>-</span>
                                    <div style={{ position: 'relative', opacity: leaveForm.isFullDay ? 0.6 : 1 }}>
                                        <span style={{ position: 'absolute', top: '-10px', left: '10px', fontSize: '12px', backgroundColor: 'white', padding: '0 5px', color: leaveFormErrors.time ? '#ff4d4f' : '#666', zIndex: 1 }}>End</span>
                                        <div style={{ display: 'flex', alignItems: 'center', border: leaveFormErrors.time ? '1px solid #ff4d4f' : '1px solid #888', borderRadius: '6px', paddingRight: '10px', height: '40px' }}>
                                            {/*
                                            <TimePicker
                                                disabled={leaveForm.isFullDay}
                                                format="HH:mm"
                                                placeholder="17:00"
                                                value={leaveForm.endTime}
                                                status={leaveFormErrors.time ? "error" : ""}
                                                hideDisabledOptions={true}
                                                disabledTime={() => {
                                                    const { startTime } = leaveForm;
                                                    const { startH: workStartH, startM: workStartM, endH: workEndH, endM: workEndM } = workTimeLimits;
                                                    return {
                                                        disabledHours: () => {
                                                            const hours = [];
                                                            for (let i = 0; i < 24; i++) {
                                                                if (i < workStartH || i > workEndH) hours.push(i);
                                                                else if (startTime && i < startTime.hour()) hours.push(i);
                                                            }
                                                            return hours;
                                                        },
                                                        disabledMinutes: (eH) => {
                                                            const mins = [];
                                                            for (let m = 0; m < 60; m++) {
                                                                if (eH === workStartH && m < workStartM) mins.push(m);
                                                                else if (eH === workEndH && m > workEndM) mins.push(m);
                                                                else if (startTime && eH === startTime.hour() && m <= startTime.minute()) mins.push(m);
                                                            }
                                                            return mins;
                                                        }
                                                    };
                                                }}
                                                onChange={(time) => {
                                                    setLeaveForm({ ...leaveForm, endTime: time });
                                                    setLeaveFormErrors({ ...leaveFormErrors, time: "" });
                                                }}
                                                style={{ width: 100, border: 'none', boxShadow: 'none' }}
                                                suffixIcon={<i className="bi bi-clock"></i>}
                                            />
                                            */}
                                            <TimePickerBootstrap
                                                disabled={leaveForm.isFullDay}
                                                step={30}
                                                format={24}
                                                start={leaveForm.startTime ? leaveForm.startTime.format('HH:mm') : `${String(workTimeLimits.startH).padStart(2, '0')}:${String(workTimeLimits.startM).padStart(2, '0')}`}
                                                end={`${String(workTimeLimits.endH).padStart(2, '0')}:${String(workTimeLimits.endM).padStart(2, '0')}`}
                                                value={leaveForm.endTime ? leaveForm.endTime.format('HH:mm') : null}
                                                onChange={(timeInt) => {
                                                    if (timeInt || timeInt === 0) {
                                                        const h = Math.floor(timeInt / 3600);
                                                        const m = Math.floor((timeInt % 3600) / 60);
                                                        const timeObj = moment().hour(h).minute(m).second(0);
                                                        setLeaveForm({ ...leaveForm, endTime: timeObj });
                                                        setLeaveFormErrors({ ...leaveFormErrors, time: "" });
                                                    } else {
                                                        setLeaveForm({ ...leaveForm, endTime: null });
                                                    }
                                                }}
                                                className="form-select border-0 shadow-none"
                                                style={{ width: 100, border: 'none', boxShadow: 'none', height: '100%', backgroundColor: 'transparent', padding: '0 8px' }}
                                            />
                                            <span style={{ fontWeight: 500 }}>น.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {leaveFormErrors.time && <span style={{ color: '#ff4d4f', fontSize: '14px', marginTop: '5px' }}>{leaveFormErrors.time}</span>}
                        </div>
                    </div>
                    {modalMode === 'edit' && (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <div style={{ fontWeight: 'bold' }}>เหตุผลเดิม</div>
                                <div style={{ marginLeft: '15px' }}>{leaveForm.original_reason || '-'}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <div style={{ fontWeight: 'bold' }}>เหตุผลที่ปฏิเสธ</div>
                                <div style={{ marginLeft: '15px' }}>{leaveForm.reject_reason || '-'}</div>
                            </div>
                        </>
                    )}
                    <div>
                        <div style={{ marginBottom: '10px', fontWeight: 'bold' }}><span style={{ color: 'red', marginRight: '5px' }}>*</span>{modalMode === 'edit' ? 'เหตุผลคำขอใหม่' : 'เหตุผล'}</div>
                        <TextArea rows={5} placeholder="กรอกเหตุผล" value={leaveForm.reason} status={leaveFormErrors.reason ? "error" : ""} onChange={(e) => { setLeaveForm({ ...leaveForm, reason: e.target.value }); setLeaveFormErrors({ ...leaveFormErrors, reason: "" }); }} style={{ border: leaveFormErrors.reason ? '2px solid #ff4d4f' : '3px solid black', borderRadius: '8px', fontSize: '16px', padding: '10px' }} />
                        {leaveFormErrors.reason && <div style={{ color: '#ff4d4f', fontSize: '14px', marginTop: '5px' }}>{leaveFormErrors.reason}</div>}
                    </div>
                </div>
            </Modal>

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

            {/* Delete Attendance Modal */}
            <Modal
                title={
                    <div style={{ backgroundColor: '#2750B0', color: 'white', padding: '16px 24px', margin: '-20px -24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '18px', fontWeight: '600', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                        <span>Delete</span>
                        <i className="bi bi-x-lg" onClick={() => setIsDeleteAttModalOpen(false)} style={{ cursor: "pointer", fontSize: "20px" }}></i>
                    </div>
                }
                open={isDeleteAttModalOpen} onCancel={() => setIsDeleteAttModalOpen(false)} closable={false} width={600} centered
                styles={{ header: { padding: 0, borderBottom: 'none' }, body: { padding: '24px' }, content: { padding: 0, overflow: 'hidden', borderRadius: '8px' }, mask: { backgroundColor: 'rgba(0, 0, 0, 0.5)' } }}
                footer={[
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', paddingBottom: '20px' }} key="footer">
                        <Button key="delete" onClick={confirmDeleteAtt} style={{ backgroundColor: '#FFBCBC', borderColor: '#000', color: 'black', fontWeight: 'bold', borderRadius: '4px', height: '40px', minWidth: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                            <i className="bi bi-trash" style={{ fontSize: '1.2em' }}></i> Delete
                        </Button>
                        <Button key="close" onClick={() => setIsDeleteAttModalOpen(false)} style={{ backgroundColor: '#d9d9d9', borderColor: '#000', color: 'black', fontWeight: 'bold', borderRadius: '4px', height: '40px', minWidth: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                            <i className="bi bi-x-lg" style={{ fontSize: '1.2em' }}></i> cancel
                        </Button>
                    </div>
                ]}
            >
                <div style={{ fontSize: '18px', color: '#000', marginTop: '20px', marginBottom: '40px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '10px' }}>ยืนยันการลบข้อมูล</div>
                    <div>คุณต้องการลบข้อมูลการขอแก้ไขเวลาของวันที่ {attToDelete?.attDate ? moment(attToDelete.attDate).format("DD/MM/YYYY") : "-"} ใช่หรือไม่?</div>
                </div>
            </Modal>

            {/* Delete Leave Modal */}
            <Modal
                title={
                    <div style={{ backgroundColor: '#2750B0', color: 'white', padding: '16px 24px', margin: '-20px -24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '18px', fontWeight: '600', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                        <span>Delete</span>
                        <i className="bi bi-x-lg" onClick={() => setIsDeleteLeaveModalOpen(false)} style={{ cursor: "pointer", fontSize: "20px" }}></i>
                    </div>
                }
                open={isDeleteLeaveModalOpen} onCancel={() => setIsDeleteLeaveModalOpen(false)} closable={false} width={600} centered
                styles={{ header: { padding: 0, borderBottom: 'none' }, body: { padding: '24px' }, content: { padding: 0, overflow: 'hidden', borderRadius: '8px' }, mask: { backgroundColor: 'rgba(0, 0, 0, 0.5)' } }}
                footer={[
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', paddingBottom: '20px' }} key="footer">
                        <Button key="delete" onClick={confirmDeleteLeave} style={{ backgroundColor: '#FFBCBC', borderColor: '#000', color: 'black', fontWeight: 'bold', borderRadius: '4px', height: '40px', minWidth: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                            <i className="bi bi-trash" style={{ fontSize: '1.2em' }}></i> Delete
                        </Button>
                        <Button key="close" onClick={() => setIsDeleteLeaveModalOpen(false)} style={{ backgroundColor: '#d9d9d9', borderColor: '#000', color: 'black', fontWeight: 'bold', borderRadius: '4px', height: '40px', minWidth: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                            <i className="bi bi-x-lg" style={{ fontSize: '1.2em' }}></i> cancel
                        </Button>
                    </div>
                ]}
            >
                <div style={{ fontSize: '18px', color: '#000', marginTop: '20px', marginBottom: '40px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '10px' }}>ยืนยันการลบ</div>
                    <div>คุณแน่ใจหรือไม่ว่าต้องการลบรายการลานี้?</div>
                </div>
            </Modal>

            {/* View Reason Modal */}
            <Modal
                title={
                    <div style={{ backgroundColor: '#2750B0', color: 'white', padding: '16px 24px', margin: '-20px -24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '18px', fontWeight: '600', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                        <span>เหตุผล</span>
                        <i className="bi bi-x-lg" onClick={() => setIsViewReasonModalOpen(false)} style={{ cursor: "pointer", fontSize: "20px" }}></i>
                    </div>
                }
                open={isViewReasonModalOpen} onCancel={() => setIsViewReasonModalOpen(false)} closable={false} width={600} centered
                styles={{ header: { padding: 0, borderBottom: 'none' }, body: { padding: '24px' }, content: { padding: 0, overflow: 'hidden', borderRadius: '8px' }, mask: { backgroundColor: 'rgba(0, 0, 0, 0.5)' } }}
                footer={[
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', paddingBottom: '20px' }} key="footer">
                        <CloseModalBtnBootstrap key="close" onClick={() => setIsViewReasonModalOpen(false)} />
                    </div>
                ]}
            >
                <div style={{ fontSize: '16px', color: '#000', marginTop: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', marginBottom: '8px' }}>
                        <div style={{ width: '130px', fontWeight: 'bold' }}>เหตุผลคำขอ :</div>
                        <div style={{ flex: 1 }}>{viewReasonData?.requestReason || "-"}</div>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <div style={{ width: '130px', fontWeight: 'bold' }}>เหตุผลที่ปฏิเสธ :</div>
                        <div style={{ flex: 1 }}>{viewReasonData?.rejectReason || "-"}</div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AttendanceLeaveMange;