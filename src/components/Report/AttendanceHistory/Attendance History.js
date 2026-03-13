import { useState, useEffect, useRef } from 'react';
import { Card, Button as ButtonBootstrap } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { DatePicker, Select, Form, Input, Modal, Row, Col, Button, Spin } from 'antd';
import { SearchToolBtnBootstrap, ClearToolBtnBootstrap, AddToolBtnBootstrap, EditToolBtnBootstrap, DeleteToolBtn, Approve_RejectBtn, CloseModalBtnBootstrap, CloseIconBtn, ApproveModalBtnBootstrap, RejectModalBtnBootstrap, ExportToolBtnBootstrap } from '../../Utilities/Buttons/Buttons';
import { RejectTag, ApproveTag, PendingApproveTag } from "../../Utilities/StatusTag/StatusTag";
import TokenService from '../../../services/token.service';
import TableUI from '../../Utilities/Table/TableUI';
import { getDropdown } from '../../../services/dropdown.service';
import { noticeShowMessage } from '../../Utilities/Notification';
import Loading from "../../Utilities/Loading";
import moment from 'moment';
import { getAttHistory } from '../../../services/AttendanceHistory.service';
import * as XLSX from 'xlsx-js-style';
import Title from '../../Utilities/Title';

const { Option } = Select;

const AttendanceHistory = ( {title} ) => {
    const navigate = useNavigate();

    const handleRequestError = (error) => {
        if (error.response) {
            const status = error.response.status;
            if (status === 401) {
                TokenService.deleteUser();
                navigate("/signin", { state: { message: "session expire" } });
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

    const columns = [
        {
            title: 'วันที่',
            dataIndex: 'attDate',
            key: 'attDate',
            align: 'center',
            render: (text) => text ? moment(text).format("DD/MM/YYYY") : "-",
            sorter: (a, b) => (a.attDate || "").localeCompare(b.attDate || ""),

        },
        {
            title: 'OA user',
            dataIndex: 'oauser',
            key: 'oauser',
            align: 'center',

            sorter: (a, b) => (a.oauser || "").localeCompare(b.oauser || ""),

        },
        {
            title: 'ชื่อ-นามสกุล',
            dataIndex: 'fullName',
            key: 'fullName',
            align: 'left',
            width: 150,
            sorter: (a, b) => (a.fullName || "").localeCompare(b.fullName || ""),

        },
        {
            title: 'Team',
            dataIndex: 'team',
            key: 'team',
            align: 'center',
            sorter: (a, b) => (a.team || "").localeCompare(b.team || ""),

        },
        {
            title: 'Check-in',
            children: [
                {
                    title: 'เวลา (น.)',
                    dataIndex: 'ciTime',
                    key: 'ciTime',
                    align: 'center',
                    sorter: (a, b) => (a.ciTime || "").localeCompare(b.ciTime || ""),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "center" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    )

                },
                {
                    title: 'สถานะเวลา',
                    dataIndex: 'ciCorrectTime',
                    key: 'ciCorrectTime',
                    align: 'center',
                    sorter: (a, b) => (a.ciCorrectTime || "").localeCompare(b.ciCorrectTime || ""),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "center" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    )

                },
                {
                    title: 'ตำแหน่ง',
                    dataIndex: 'ciAddress',
                    key: 'ciAddress',
                    align: 'left',
                    sorter: (a, b) => (a.ciAddress || "").localeCompare(b.ciAddress || ""),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    )

                },
                {
                    title: 'สถานะตำแหน่ง',
                    dataIndex: 'ciCorrectZone',
                    key: 'ciCorrectZone',
                    align: 'center',
                    sorter: (a, b) => (a.ciCorrectZone || "").localeCompare(b.ciCorrectZone || ""),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "center" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    )

                },
                {
                    title: 'เหตุผล',
                    dataIndex: 'ciReason',
                    key: 'ciReason',
                    align: 'left',
                    render: (text) => <div style={{ whiteSpace: 'pre-line' }}>{text}</div>,
                    sorter: (a, b) => (a.ciReason || "").localeCompare(b.ciReason || ""),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    )


                },
            ],
        },
        {
            title: 'Check-out',
            children: [
                {
                    title: 'เวลา (น.)',
                    dataIndex: 'coTime',
                    key: 'coTime',
                    align: 'center',
                    sorter: (a, b) => (a.coTime || "").localeCompare(b.coTime || ""),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "center" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    )
                },
                {
                    title: 'สถานะเวลา',
                    dataIndex: 'coCorrectTime',
                    key: 'coCorrectTime',
                    align: 'center',
                    sorter: (a, b) => (a.coCorrectTime || "").localeCompare(b.coCorrectTime || ""),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "center" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    )

                },
                {
                    title: 'ตำแหน่ง',
                    dataIndex: 'coAddress',
                    key: 'coAddress',
                    align: 'left',
                    sorter: (a, b) => (a.coAddress || "").localeCompare(b.coAddress || ""),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    )

                },
                {
                    title: 'สถานะตำแหน่ง',
                    dataIndex: 'coCorrectZone',
                    key: 'coCorrectZone',
                    align: 'center',
                    sorter: (a, b) => (a.coCorrectZone || "").localeCompare(b.coCorrectZone || ""),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "center" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    )

                },
                {
                    title: 'เหตุผล',
                    dataIndex: 'coReason',
                    key: 'coReason',
                    align: 'left',
                    render: (text) => <div style={{ whiteSpace: 'pre-line' }}>{text}</div>,
                    sorter: (a, b) => (a.coReason || "").localeCompare(b.coReason || ""),
                    render: (text) => (
                        <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                            {text && text.trim() ? text : "-"}
                        </div>
                    )

                },
            ],
        },
    ];

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [team, setTeam] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [ciTimeStatus, setCiTimeStatus] = useState("ทั้งหมด");
    const [coTimeStatus, setCoTimeStatus] = useState("ทั้งหมด");
    const [ciLocationStatus, setCiLocationStatus] = useState("ทั้งหมด");
    const [coLocationStatus, setCoLocationStatus] = useState("ทั้งหมด");

    const [openCiTimeDropdown, setOpenCiTimeDropdown] = useState(false);
    const [openCoTimeDropdown, setOpenCoTimeDropdown] = useState(false);
    const [openCiLocationDropdown, setOpenCiLocationDropdown] = useState(false);
    const [openCoLocationDropdown, setOpenCoLocationDropdown] = useState(false);
    const [openTeamDropdown, setOpenTeamDropdown] = useState(false);

    const searchFilterRef = useRef(null);

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            // Close all dropdowns
            setOpenCiTimeDropdown(false);
            setOpenCoTimeDropdown(false);
            setOpenCiLocationDropdown(false);
            setOpenCoLocationDropdown(false);
            setOpenTeamDropdown(false);

            // Optional: Blur active element so dropdowns or inputs close
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
            handleSearch();
        }
    };

    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);

    const [teamList, setTeamList] = useState([]);
    const [ciTimeStatusList, setCiTimeStatusList] = useState([]);
    const [coTimeStatusList, setCoTimeStatusList] = useState([]);
    const [correctZoneList, setCorrectZoneList] = useState([]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const payload = {
                start_date: startDate ? startDate.format('YYYY-MM-DD') : null,
                end_date: endDate ? endDate.format('YYYY-MM-DD') : null,
                team: team === "ทั้งหมด" ? null : team,
                search_text: searchText || null,
                ci_time_status: ciTimeStatus === "ทั้งหมด" ? null : ciTimeStatus,
                co_time_status: coTimeStatus === "ทั้งหมด" ? null : coTimeStatus,
                ci_location_status: ciLocationStatus === "ทั้งหมด" ? null : ciLocationStatus,
                co_location_status: coLocationStatus === "ทั้งหมด" ? null : coLocationStatus,
            };

            const response = await getAttHistory.get_attHistory(payload);
            if (response && response.data) {
                setDataSource(response.data);
            } else {
                setDataSource([]);
            }
        } catch (error) {
            console.error("Error fetching attendance history:", error);
            handleRequestError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setStartDate(null);
        setEndDate(null);
        setTeam(null);
        setSearchText("");
        setCiTimeStatus("ทั้งหมด");
        setCoTimeStatus("ทั้งหมด");
        setCiLocationStatus("ทั้งหมด");
        setCoLocationStatus("ทั้งหมด");

        setLoading(true);
        const payload = {
            start_date: null,
            end_date: null,
            team: null,
            search_text: null,
            ci_time_status: null,
            co_time_status: null,
            ci_location_status: null,
            co_location_status: null,
        };

        getAttHistory.get_attHistory(payload)
            .then(response => {
                if (response && response.data) {
                    setDataSource(response.data);
                } else {
                    setDataSource([]);
                }
            })
            .catch(error => {
                console.error("Error fetching attendance history:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleExport = () => {
        if (!dataSource || dataSource.length === 0) {
            noticeShowMessage("ไม่มีข้อมูลสำหรับส่งออก", true);
            return;
        }

        const wsData = [
            ["วันที่", "OA user", "ชื่อ-นามสกุล", "Team", "Check-in", "", "", "", "", "Check-out", "", "", "", ""],
            ["", "", "", "", "เวลา (น.)", "สถานะเวลา", "ตำแหน่ง", "สถานะตำแหน่ง", "เหตุผล", "เวลา (น.)", "สถานะเวลา", "ตำแหน่ง", "สถานะตำแหน่ง", "เหตุผล"]
        ];

        dataSource.forEach(item => {
            wsData.push([
                item.attDate ? moment(item.attDate).format("DD/MM/YYYY") : "-",
                item.oauser || "-",
                item.fullName || "-",
                item.team || "-",
                item.ciTime || "-",
                item.ciCorrectTime || "-",
                item.ciAddress || "-",
                item.ciCorrectZone || "-",
                item.ciReason || "-",
                item.coTime || "-",
                item.coCorrectTime || "-",
                item.coAddress || "-",
                item.coCorrectZone || "-",
                item.coReason || "-"
            ]);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(wsData);

        // Nested headers merges
        worksheet["!merges"] = [
            { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
            { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
            { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
            { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },
            { s: { r: 0, c: 4 }, e: { r: 0, c: 8 } },
            { s: { r: 0, c: 9 }, e: { r: 0, c: 13 } }
        ];

        // Add Autofilter & Protection
        worksheet['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 1, c: 0 }, e: { r: wsData.length - 1, c: 13 } }) };
        worksheet['!protect'] = {
            password: "admin",
            selectLockedCells: true,
            selectUnlockedCells: true
        };

        // Column widths
        worksheet['!cols'] = [
            { wch: 15 }, // วันที่
            { wch: 20 }, // OA user
            { wch: 30 }, // ชื่อ-นามสกุล
            { wch: 15 }, // Team
            { wch: 15 }, // CI เวลา
            { wch: 20 }, // CI สถานะ
            { wch: 40 }, // CI ตำแหน่ง
            { wch: 20 }, // CI สถานะตำแหน่ง
            { wch: 30 }, // CI เหตุผล
            { wch: 15 }, // CO เวลา
            { wch: 20 }, // CO สถานะ
            { wch: 40 }, // CO ตำแหน่ง
            { wch: 20 }, // CO สถานะตำแหน่ง
            { wch: 30 }, // CO เหตุผล
        ];

        // Apply styles
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cell_address = { c: C, r: R };
                const cell_ref = XLSX.utils.encode_cell(cell_address);
                if (!worksheet[cell_ref]) continue;

                if (!worksheet[cell_ref].s) worksheet[cell_ref].s = {};

                // Default borders
                worksheet[cell_ref].s.border = {
                    top: { style: "thin", color: { auto: 1 } },
                    bottom: { style: "thin", color: { auto: 1 } },
                    left: { style: "thin", color: { auto: 1 } },
                    right: { style: "thin", color: { auto: 1 } }
                };

                // Vertical Center & wrap text by default
                worksheet[cell_ref].s.alignment = { vertical: "center", wrapText: true };

                if (R === 0 || R === 1) {
                    // Header Row
                    worksheet[cell_ref].s.fill = { fgColor: { rgb: "A0BDFF" } };
                    worksheet[cell_ref].s.font = { bold: true };
                    worksheet[cell_ref].s.alignment.horizontal = "center";
                } else {
                    // Data Rows
                    if (C === 1 || C === 2) {
                        // OA User, ชื่อ-นามสกุล
                        worksheet[cell_ref].s.alignment.horizontal = "left";
                    } else if (C === 6 || C === 8 || C === 11 || C === 13) {
                        // Address, Reason
                        worksheet[cell_ref].s.alignment.horizontal = "left";
                    } else {
                        // Others
                        worksheet[cell_ref].s.alignment.horizontal = "center";
                    }
                }
            }
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance History");

        XLSX.writeFile(workbook, `Attendance_History_${moment().format("YYYYMMDD_HHmmss")}.xlsx`);
    };

    useEffect(() => {
        document.title = Title.get_title(title);
        const fetchDropdowns = async () => {
            try {
                const [ciTimeRes, coTimeRes, zoneRes, teamRes] = await Promise.all([
                    getDropdown.get_dropdown({ type: 'CI_CorrectTime' }),
                    getDropdown.get_dropdown({ type: 'CO_CorrectTime' }),
                    getDropdown.get_dropdown({ type: 'CorrectZone' }),
                    getDropdown.get_dropdown({ type: 'Team' })
                ]);

                if (ciTimeRes && ciTimeRes.data) setCiTimeStatusList(ciTimeRes.data);
                if (coTimeRes && coTimeRes.data) setCoTimeStatusList(coTimeRes.data);
                if (zoneRes && zoneRes.data) setCorrectZoneList(zoneRes.data);
                if (teamRes && teamRes.data) setTeamList(teamRes.data);
            } catch (error) {
                console.error("Error fetching dropdowns:", error);
                handleRequestError(error);
            }
        };
        fetchDropdowns();
        handleSearch();
    }, []);

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
                    Search
                </Card.Header>
                <Card.Body>
                    <div
                        style={{ background: "white", borderRadius: "6px", outline: "none" }}
                        ref={searchFilterRef}
                        tabIndex={-1}
                        onKeyDown={handleSearchKeyDown}
                    >
                        <div className="row">
                            <div className="col-lg-8 col-md-12">
                                {/* Row 1 fields */}
                                <div className="d-flex align-items-center flex-wrap gap-4 mb-3">
                                    {/* วันที่ */}
                                    <div className="d-flex align-items-center gap-2">
                                        <span style={{ fontWeight: 700, fontSize: '16px' }}>วันที่ :</span>
                                        <div style={{ position: 'relative', marginTop: '4px' }}>
                                            <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '11px', color: '#888', zIndex: 1 }}>Start Date</span>
                                            <DatePicker
                                                value={startDate}
                                                inputReadOnly={true}
                                                onChange={(date) => {
                                                    setStartDate(date);
                                                    requestAnimationFrame(() => searchFilterRef.current?.focus());
                                                }}
                                                onKeyDown={handleSearchKeyDown}
                                                disabledDate={(current) => {
                                                    return endDate ? current && current > endDate.endOf('day') : false;
                                                }}
                                                style={{ width: 130 }}
                                                format="DD/MM/YYYY"
                                                placeholder="DD/MM/YYYY"
                                            />
                                        </div>
                                        <span>-</span>
                                        <div style={{ position: 'relative', marginTop: '4px' }}>
                                            <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '11px', color: '#888', zIndex: 1 }}>End Date</span>
                                            <DatePicker
                                                value={endDate}
                                                inputReadOnly={true}
                                                onChange={(date) => {
                                                    setEndDate(date);
                                                    requestAnimationFrame(() => searchFilterRef.current?.focus());
                                                }}
                                                onKeyDown={handleSearchKeyDown}
                                                disabledDate={(current) => {
                                                    return startDate ? current && current < startDate.startOf('day') : false;
                                                }}
                                                style={{ width: 130 }}
                                                format="DD/MM/YYYY"
                                                placeholder="DD/MM/YYYY"
                                            />
                                        </div>
                                    </div>

                                    {/* สถานะเวลา */}
                                    <div className="d-flex align-items-center gap-2">
                                        <span style={{ fontWeight: 700, fontSize: '16px' }}>สถานะเวลา:</span>
                                        <div style={{ position: 'relative', marginTop: '4px' }}>
                                            <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '11px', color: '#888', zIndex: 1 }}>Check-In</span>
                                            <Select
                                                value={ciTimeStatus}
                                                open={openCiTimeDropdown}
                                                onDropdownVisibleChange={(open) => setOpenCiTimeDropdown(open)}
                                                onChange={(val) => {
                                                    setCiTimeStatus(val);
                                                    requestAnimationFrame(() => searchFilterRef.current?.focus());
                                                }}
                                                placeholder="ทั้งหมด"
                                                style={{ width: 110 }}

                                            >
                                                <Option value="ทั้งหมด">ทั้งหมด</Option>
                                                {ciTimeStatusList.map((item, idx) => (
                                                    <Option key={idx} value={item.value}>{item.label}</Option>
                                                ))}
                                            </Select>
                                        </div>
                                        <div style={{ position: 'relative', marginTop: '4px' }}>
                                            <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '11px', color: '#888', zIndex: 1 }}>Check-Out</span>
                                            <Select
                                                value={coTimeStatus}
                                                open={openCoTimeDropdown}
                                                onDropdownVisibleChange={(open) => setOpenCoTimeDropdown(open)}
                                                onChange={(val) => {
                                                    setCoTimeStatus(val);
                                                    requestAnimationFrame(() => searchFilterRef.current?.focus());
                                                }}
                                                placeholder="ทั้งหมด"
                                                style={{ width: 110 }}
                                            >
                                                <Option value="ทั้งหมด">ทั้งหมด</Option>
                                                {coTimeStatusList.map((item, idx) => (
                                                    <Option key={idx} value={item.value}>{item.label}</Option>
                                                ))}
                                            </Select>
                                        </div>
                                    </div>

                                    {/* สถานะตำแหน่ง */}
                                    <div className="d-flex align-items-center gap-2">
                                        <span style={{ fontWeight: 700, fontSize: '16px' }}>สถานะตำแหน่ง:</span>
                                        <div style={{ position: 'relative', marginTop: '4px' }}>
                                            <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '11px', color: '#888', zIndex: 1 }}>Check-In</span>
                                            <Select
                                                value={ciLocationStatus}
                                                open={openCiLocationDropdown}
                                                onDropdownVisibleChange={(open) => setOpenCiLocationDropdown(open)}
                                                onChange={(val) => {
                                                    setCiLocationStatus(val);
                                                    requestAnimationFrame(() => searchFilterRef.current?.focus());
                                                }}
                                                placeholder="ทั้งหมด"
                                                style={{ width: 110 }}
                                            >
                                                <Option value="ทั้งหมด">ทั้งหมด</Option>
                                                {correctZoneList.map((item, idx) => (
                                                    <Option key={idx} value={item.value}>{item.label}</Option>
                                                ))}
                                            </Select>
                                        </div>
                                        <div style={{ position: 'relative', marginTop: '4px' }}>
                                            <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '11px', color: '#888', zIndex: 1 }}>Check-Out</span>
                                            <Select
                                                value={coLocationStatus}
                                                open={openCoLocationDropdown}
                                                onDropdownVisibleChange={(open) => setOpenCoLocationDropdown(open)}
                                                onChange={(val) => {
                                                    setCoLocationStatus(val);
                                                    requestAnimationFrame(() => searchFilterRef.current?.focus());
                                                }}
                                                placeholder="ทั้งหมด"
                                                style={{ width: 110 }}
                                            >
                                                <Option value="ทั้งหมด">ทั้งหมด</Option>
                                                {correctZoneList.map((item, idx) => (
                                                    <Option key={idx} value={item.value}>{item.label}</Option>
                                                ))}
                                            </Select>
                                        </div>
                                    </div>



                                    <div className="d-flex align-items-center gap-2">
                                        <span style={{ fontWeight: 700, fontSize: '16px' }}>Team :</span>
                                        <Select
                                            placeholder="ทั้งหมด"
                                            value={team}
                                            open={openTeamDropdown}
                                            onDropdownVisibleChange={(open) => setOpenTeamDropdown(open)}
                                            onChange={(val) => {
                                                setTeam(val);
                                                requestAnimationFrame(() => searchFilterRef.current?.focus());
                                            }}
                                            style={{ width: 150 }}

                                        >
                                            <Option value={null}>ทั้งหมด</Option>
                                            {teamList.map((t, idx) => (
                                                <Option key={idx} value={t.value}>{t.label}</Option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="d-flex align-items-center gap-2">
                                        <span style={{ fontWeight: 700, fontSize: '16px' }}>ชื่อ-นามสกุลหรือ OA User :</span>
                                        <Input
                                            placeholder="กรอกชื่อ-นามสกุลหรือ OA User"
                                            value={searchText}
                                            onChange={(e) => setSearchText(e.target.value)}
                                            onKeyDown={handleSearchKeyDown}
                                            style={{ width: 250 }}
                                        />
                                    </div>
                                </div>

                            </div>

                            {/* Buttons */}
                            <div className="col-lg-4 col-md-12 d-flex justify-content-lg-end align-items-start gap-2 mt-3 mt-lg-0">
                                <SearchToolBtnBootstrap onClick={handleSearch} />
                                <ClearToolBtnBootstrap onClick={handleClear} />
                                <ExportToolBtnBootstrap onClick={handleExport} />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: "15px", maxWidth: "100%", overflowX: "auto", overflowY: "hidden" }}>
                        <div style={{ minWidth: "1800px" }}>
                            <TableUI
                                columns={columns}
                                dataSource={dataSource}
                                pagination={true}
                                bordered={true}
                                size="small"
                                rowSelection={undefined}
                                rowKey={(record, index) => record.id || index}
                            />
                        </div>
                    </div>

                </Card.Body>
            </Card>

        </div>
    );
};

export default AttendanceHistory;