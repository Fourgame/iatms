import { useState, useEffect } from 'react';
import { Card, Button as ButtonBootstrap } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { DatePicker, Select, Form, Input, Modal, Row, Col, Button } from 'antd';
import { SearchToolBtnBootstrap, ClearToolBtnBootstrap, AddToolBtnBootstrap, EditToolBtnBootstrap, DeleteToolBtn, Approve_RejectBtn, CloseModalBtnBootstrap, CloseIconBtn, ApproveModalBtnBootstrap, RejectModalBtnBootstrap, ExportToolBtnBootstrap } from '../../Utilities/Buttons/Buttons';
import { RejectTag, ApproveTag, PendingApproveTag } from "../../Utilities/StatusTag/StatusTag";
import TokenService from '../../../services/token.service';
import TableUI from '../../Utilities/Table/TableUI';
import { getDropdown } from '../../../services/dropdown.service';
import { noticeShowMessage } from '../../Utilities/Notification';
import Loading from "../../Utilities/Loading";
import { getCompensation, getMonthYearCompensation } from '../../../services/Compensation.service';
import moment from 'moment';
import * as XLSX from 'xlsx-js-style';

const { Option } = Select;

const Compensation = () => {
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
            if (status === 403) return navigate("/signin", { state: { message: "access-denied" } });
            if (status === 404) return navigate("/signin", { state: { message: "not-found" } });

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
            title: 'เดือน-ปี',
            dataIndex: 'monthYear',
            key: 'monthYear',
            align: 'center',
            sorter: (a, b) => (a.monthYear || "").localeCompare(b.monthYear || ""),
        },
        {
            title: 'OA User',
            dataIndex: 'oaUser',
            key: 'oaUser',
            align: 'center',
            sorter: (a, b) => (a.oaUser || "").localeCompare(b.oaUser || ""),
        },
        {
            title: 'ชื่อ-นามสกุล',
            dataIndex: 'fullName',
            key: 'fullName',
            align: 'center',
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
            title: 'จำนวนชั่วโมง (ชั่วโมง)',
            dataIndex: 'workHours',
            key: 'workHours',
            align: 'center',
            sorter: (a, b) => {
                const aVal = parseFloat((a.workHours || "").toString().replace(/,/g, '')) || 0;
                const bVal = parseFloat((b.workHours || "").toString().replace(/,/g, '')) || 0;
                return aVal - bVal;
            },
            render: (text) => text !== null && text !== undefined ? Number(text).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'
        },
        {
            title: 'จำนวนเงิน (บาท)',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            sorter: (a, b) => {
                const aVal = parseFloat((a.amount || "").toString().replace(/,/g, '')) || 0;
                const bVal = parseFloat((b.amount || "").toString().replace(/,/g, '')) || 0;
                return aVal - bVal;
            },
            render: (text) => text !== null && text !== undefined ? Number(text).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'
        },
    ];

    // States
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [searchText, setSearchText] = useState("");
    const [team, setTeam] = useState("ทั้งหมด");
    const [startMonthYear, setStartMonthYear] = useState(null);
    const [endMonthYear, setEndMonthYear] = useState(null);
    const [minMonthYear, setMinMonthYear] = useState(null);

    // Dropdowns
    const [teamList, setTeamList] = useState([]);

    // Summary calculation
    const totalHours = dataSource.reduce((sum, item) => sum + (Number(item.workHours) || 0), 0);
    const totalAmount = dataSource.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const fetchData = async () => {
        setLoading(true);
        try {
            const payload = {
                search_text: searchText || null,
                team: team === "ทั้งหมด" ? null : team,
                start_month_year: startMonthYear ? startMonthYear.format('YYYY-MM') : null,
                end_month_year: endMonthYear ? endMonthYear.format('YYYY-MM') : null
            };
            const res = await getCompensation.get_compensation(payload);
            if (res && res.data) {
                setDataSource(res.data);
            } else {
                setDataSource([]);
            }
        } catch (error) {
            console.error("Error fetching compensation data", error);
            handleRequestError(error);
            setDataSource([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdowns = async () => {
        try {
            const teamRes = await getDropdown.get_dropdown({ type: 'Team' });
            if (teamRes && teamRes.data) {
                setTeamList(teamRes.data);
            }
        } catch (error) {
            console.error("Error fetching teams", error);
            handleRequestError(error);
        }
    }

    const fetchMinMonthYear = async () => {
        try {
            const res = await getMonthYearCompensation.get_month_year_compensation();
            let minVal = null;
            if (res && res.data) {
                if (Array.isArray(res.data) && res.data.length > 0) {
                    minVal = res.data[0].monthYear;
                } else if (!Array.isArray(res.data) && res.data.monthYear) {
                    minVal = res.data.monthYear;
                }
            }
            if (minVal) {
                setMinMonthYear(moment(minVal, 'MM/YYYY'));
            } else {
                setMinMonthYear(null);
            }
        } catch (error) {
            console.error("Error fetching min month year", error);
            handleRequestError(error);
            setMinMonthYear(null);
        }
    };

    useEffect(() => {
        fetchDropdowns();
        fetchMinMonthYear();
        fetchData();
    }, []);

    const handleSearch = () => {
        fetchData();
    };

    const handleClear = () => {
        setSearchText("");
        setTeam("ทั้งหมด");
        setStartMonthYear(null);
        setEndMonthYear(null);

        // Fetch original
        setLoading(true);
        getCompensation.get_compensation({}).then(res => {
            if (res && res.data) setDataSource(res.data);
            else setDataSource([]);
        }).catch(err => {
            console.error(err);
            handleRequestError(err);
            setDataSource([]);
        }).finally(() => setLoading(false));
    };

    const handleExport = () => {
        if (!dataSource || dataSource.length === 0) {
            noticeShowMessage("ไม่มีข้อมูลสำหรับส่งออก", true);
            return;
        }

        const exportData = dataSource.map(item => ({
            "เดือน-ปี": item.monthYear || "-",
            "OA User": item.oaUser || "-",
            "ชื่อ-นามสกุล": item.fullName || "-",
            "Team": item.team || "-",
            "จำนวนชั่วโมง (ชั่วโมง)": item.workHours !== null && item.workHours !== undefined ? Number(item.workHours).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-",
            "จำนวนเงิน (บาท)": item.amount !== null && item.amount !== undefined ? Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"
        }));

        // Add Summary row
        exportData.push({
            "เดือน-ปี": "สรุป",
            "OA User": "",
            "ชื่อ-นามสกุล": "",
            "Team": "",
            "จำนวนชั่วโมง (ชั่วโมง)": totalHours !== null && totalHours !== undefined ? Number(totalHours).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00",
            "จำนวนเงิน (บาท)": totalAmount !== null && totalAmount !== undefined ? Number(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        // Add Autofilter & Protection
        worksheet['!autofilter'] = { ref: worksheet['!ref'] };
        worksheet['!protect'] = {
            password: "admin",
            selectLockedCells: true,
            selectUnlockedCells: true
        };

        // Merge Summary Row (Columns 0 to 3)
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        worksheet["!merges"] = [
            { s: { r: range.e.r, c: 0 }, e: { r: range.e.r, c: 3 } }
        ];

        // Column widths
        worksheet['!cols'] = [
            { wch: 15 }, // เดือน-ปี
            { wch: 20 }, // OA User
            { wch: 30 }, // ชื่อ-นามสกุล
            { wch: 15 }, // Team
            { wch: 25 }, // จำนวนชั่วโมง (ชั่วโมง)
            { wch: 20 }, // จำนวนเงิน (บาท)
        ];

        // Apply styles
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

                // Vertical Center by default
                worksheet[cell_ref].s.alignment = { vertical: "center" };

                if (R === 0) {
                    // Header Row
                    worksheet[cell_ref].s.fill = { fgColor: { rgb: "A0BDFF" } };
                    worksheet[cell_ref].s.font = { bold: true };
                    worksheet[cell_ref].s.alignment.horizontal = "center";
                } else if (R === range.e.r) {
                    // Summary Row
                    worksheet[cell_ref].s.fill = { fgColor: { rgb: "DEE8FF" } };
                    worksheet[cell_ref].s.font = { bold: true };
                    if (C === 0) {
                        worksheet[cell_ref].s.alignment.horizontal = "right";
                    } else if (C === 4 || C === 5) {
                        worksheet[cell_ref].s.alignment.horizontal = "right";
                    }
                } else {
                    // Data Rows
                    if (C === 2 || C === 1) {
                        // ชื่อ-นามสกุล and OA User let's left align
                        worksheet[cell_ref].s.alignment.horizontal = "left";
                    } else if (C === 4 || C === 5) {
                        // Amounts right align
                        worksheet[cell_ref].s.alignment.horizontal = "right";
                    } else {
                        // Others center align
                        worksheet[cell_ref].s.alignment.horizontal = "center";
                    }
                }
            }
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Compensation");

        XLSX.writeFile(workbook, `Compensation_${moment().format("YYYYMMDD_HHmmss")}.xlsx`);
    };

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
                <Card.Body >
                    <div style={{ background: "white", borderRadius: "6px" }}>
                        <div className="d-flex flex-wrap flex-lg-nowrap justify-content-between align-items-start gap-3">
                            {/* Left Side: Filter Fields */}
                            <div className="d-flex flex-wrap align-items-center gap-4">
                                {/* ชื่อ-นามสกุลหรือ OA User */}
                                <div className="d-flex align-items-center gap-2">
                                    <span style={{ fontWeight: 700, fontSize: '16px' }}>ชื่อ-นามสกุลหรือ OA User :</span>
                                    <Input
                                        placeholder="กรอกชื่อ-นามสกุลหรือ OA User"
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        style={{ width: 250 }}
                                    />
                                </div>

                                {/* Team */}
                                <div className="d-flex align-items-center gap-2">
                                    <span style={{ fontWeight: 700, fontSize: '16px' }}>Team :</span>
                                    <Select
                                        placeholder="ทั้งหมด"
                                        value={team}
                                        onChange={(val) => {
                                            setTeam(val);
                                            setStartMonthYear(null);
                                            setEndMonthYear(null);
                                        }}
                                        style={{ width: 150 }}
                                    >
                                        <Option value="ทั้งหมด">ทั้งหมด</Option>
                                        {teamList.map((t, idx) => (
                                            <Option key={idx} value={t.value}>{t.label}</Option>
                                        ))}
                                    </Select>
                                </div>

                                {/* เดือน/ปี */}
                                <div className="d-flex align-items-center gap-2">
                                    <span style={{ fontWeight: 700, fontSize: '16px' }}>เดือน/ปี :</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <div style={{ position: 'relative', marginTop: '4px' }}>
                                            <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '11px', color: '#888', zIndex: 1 }}>Start Month/Year</span>
                                            <DatePicker
                                                allowClear={true}
                                                picker="month"
                                                value={startMonthYear}
                                                onChange={(date) => setStartMonthYear(date)}
                                                disabledDate={(current) => {
                                                    if (!current) return false;
                                                    const isBeforeMin = minMonthYear ? current.isBefore(minMonthYear, 'month') : false;
                                                    const isAfterNow = current.isAfter(moment(), 'month');
                                                    const isAfterEnd = endMonthYear ? current.isAfter(endMonthYear, 'month') : false;
                                                    return isBeforeMin || isAfterNow || isAfterEnd;
                                                }}
                                                style={{ width: 130 }}
                                                format="MM/YYYY"
                                                placeholder="MM/YYYY"
                                            />
                                        </div>
                                        <span>-</span>
                                        <div style={{ position: 'relative', marginTop: '4px' }}>
                                            <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '11px', color: '#888', zIndex: 1 }}>End Month/Year</span>
                                            <DatePicker
                                                allowClear={true}
                                                picker="month"
                                                value={endMonthYear}
                                                onChange={(date) => setEndMonthYear(date)}
                                                disabledDate={(current) => {
                                                    if (!current) return false;
                                                    const isBeforeMin = minMonthYear ? current.isBefore(minMonthYear, 'month') : false;
                                                    const isAfterNow = current.isAfter(moment(), 'month');
                                                    const isBeforeStart = startMonthYear ? current.isBefore(startMonthYear, 'month') : false;
                                                    return isBeforeMin || isAfterNow || isBeforeStart;
                                                }}
                                                style={{ width: 130 }}
                                                format="MM/YYYY"
                                                placeholder="MM/YYYY"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Buttons and Mockup Text */}
                            <div className="d-flex flex-column align-items-lg-end gap-2 mt-2 mt-lg-0">
                                <div className="d-flex align-items-center gap-2">
                                    <SearchToolBtnBootstrap onClick={handleSearch} />
                                    <ClearToolBtnBootstrap onClick={handleClear} />
                                    <ExportToolBtnBootstrap onClick={handleExport} />
                                </div>

                                {/* Mockup Text */}
                                <div style={{
                                    background: "#DEE8FF",
                                    padding: "6px 15px",
                                    borderRadius: "4px",
                                    border: "1px solid #000000ff",
                                    fontWeight: 600,
                                    color: "#000000ff",
                                    fontSize: "16px",
                                    boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                                }}>
                                    ชั่วโมงรวม {totalHours.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ชั่วโมง จำนวนเงิน {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: "15px" }}>
                        <TableUI
                            columns={columns}
                            dataSource={dataSource}
                            loading={loading}
                            pagination={true}
                            bordered={true}
                            size="small"
                            rowSelection={undefined}
                            rowKey={(record, index) => record.id || index}
                        />
                    </div>

                </Card.Body>
            </Card>

        </div>
    );
};

export default Compensation;