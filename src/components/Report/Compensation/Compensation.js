import { useState, useEffect, useRef } from 'react';
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
import Title from '../../Utilities/Title';

const { Option } = Select;

const Compensation = ( {title} ) => {
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
            align: 'left',
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
            title: 'จำนวนชั่วโมง',
            dataIndex: 'workHours',
            key: 'workHours',
            align: 'center',
            sorter: (a, b) => {
                const aVal = parseFloat((a.workHours || "").toString().replace(/,/g, '')) || 0;
                const bVal = parseFloat((b.workHours || "").toString().replace(/,/g, '')) || 0;
                return aVal - bVal;
            },
            render: (text) => {
                if (text !== null && text !== undefined) {
                    const minutes = parseFloat(text.toString().replace(/,/g, '')) || 0;
                    const duration = moment.duration(minutes, 'minutes');
                    const hrs = Math.floor(duration.asHours());
                    const mins = duration.minutes();
                    return mins === 0 ? `${hrs} ชั่วโมง` : `${hrs} ชั่วโมง ${mins} นาที`;
                }
                return '-';
            }
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
    const [openTeamDropdown, setOpenTeamDropdown] = useState(false);

    const searchFilterRef = useRef(null);

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            // Close dropdowns
            setOpenTeamDropdown(false);

            // Optional: Blur active element so dropdowns or inputs close
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
            handleSearch();
        }
    };

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
        document.title = Title.get_title(title);
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

        const exportData = dataSource.map(item => {
            const minutes = parseFloat((item.workHours || "").toString().replace(/,/g, '')) || 0;
            const duration = moment.duration(minutes, 'minutes');
            const hrs = Math.floor(duration.asHours());
            const mins = duration.minutes();

            return {
                "เดือน-ปี": item.monthYear || "-",
                "OA User": item.oaUser || "-",
                "ชื่อ-นามสกุล": item.fullName || "-",
                "Team": item.team || "-",
                "จำนวนชั่วโมง": item.workHours !== null && item.workHours !== undefined ? (mins === 0 ? `${hrs} ชั่วโมง` : `${hrs} ชั่วโมง ${mins} นาที`) : "-",
                "จำนวนเงิน (บาท)": item.amount !== null && item.amount !== undefined ? Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"
            };
        });

        const totalHrsStr = Math.floor(moment.duration(totalHours, 'minutes').asHours());
        const totalMinsStr = moment.duration(totalHours, 'minutes').minutes();

        // Add Summary row
        exportData.push({
            "เดือน-ปี": "สรุป",
            "OA User": "",
            "ชื่อ-นามสกุล": "",
            "Team": "",
            "จำนวนชั่วโมง": totalHours !== null && totalHours !== undefined ? (totalMinsStr === 0 ? `${totalHrsStr} ชั่วโมง` : `${totalHrsStr} ชั่วโมง ${totalMinsStr} นาที`) : "-",
            "จำนวนเงิน (บาท)": totalAmount !== null && totalAmount !== undefined ? Number(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const range = XLSX.utils.decode_range(worksheet['!ref']);

        // Add Autofilter excluding summary row
        const filterRange = { s: { r: 0, c: 0 }, e: { r: range.e.r - 1, c: range.e.c } };
        worksheet['!autofilter'] = { ref: XLSX.utils.encode_range(filterRange) };

        worksheet['!protect'] = {
            password: "admin",
            selectLockedCells: true,
            selectUnlockedCells: true
        };

        // Merge Summary Row (Columns 0 to 3)
        worksheet["!merges"] = [
            { s: { r: range.e.r, c: 0 }, e: { r: range.e.r, c: 3 } }
        ];

        // Column widths - Autofit up to max 80 characters
        const colKeys = Object.keys(exportData[0]);
        worksheet['!cols'] = colKeys.map(key => {
            let max = key.length;
            exportData.forEach(row => {
                const valStr = row[key] ? row[key].toString() : "";
                if (valStr.length > max) max = valStr.length;
            });
            // Tahoma 14 is wider than default, so scale up max length and add padding
            return { wch: Math.min(Math.floor(max * 1.2) + 8, 80) };
        });

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

                // Vertical Center by default, wrap text, and Tahoma 14
                worksheet[cell_ref].s.alignment = { vertical: "center", wrapText: true };
                worksheet[cell_ref].s.font = { name: "Tahoma", sz: 14 };

                if (R === 0) {
                    // Header Row
                    worksheet[cell_ref].s.fill = { fgColor: { rgb: "A0BDFF" } };
                    worksheet[cell_ref].s.font.bold = true;
                    worksheet[cell_ref].s.alignment.horizontal = "center";
                } else if (R === range.e.r) {
                    // Summary Row
                    worksheet[cell_ref].s.fill = { fgColor: { rgb: "DEE8FF" } };
                    worksheet[cell_ref].s.font.bold = true;
                    if (C === 0) {
                        worksheet[cell_ref].s.alignment.horizontal = "right";
                    } else if (C === 4 || C === 5) {
                        worksheet[cell_ref].s.alignment.horizontal = "right";
                    }
                } else {
                    // Data Rows
                    if (worksheet[cell_ref].v === "-") {
                        worksheet[cell_ref].s.alignment.horizontal = "center";
                    } else if (C === 1 || C === 2) {
                        // OA User, ชื่อ-นามสกุล let's left align
                        worksheet[cell_ref].s.alignment.horizontal = "left";
                    } else if (C === 5) {
                        // Amount right align
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
                <Card.Body>
                    <div
                        style={{ background: "white", borderRadius: "6px", outline: "none" }}
                        ref={searchFilterRef}
                        tabIndex={-1}
                        onKeyDown={handleSearchKeyDown}
                    >
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
                                        onKeyDown={handleSearchKeyDown}
                                        style={{ width: 250 }}
                                    />
                                </div>

                                {/* Team */}
                                <div className="d-flex align-items-center gap-2">
                                    <span style={{ fontWeight: 700, fontSize: '16px' }}>Team :</span>
                                    <Select
                                        placeholder="ทั้งหมด"
                                        value={team}
                                        open={openTeamDropdown}
                                        onDropdownVisibleChange={(open) => setOpenTeamDropdown(open)}
                                        onChange={(val) => {
                                            setTeam(val);
                                            setStartMonthYear(null);
                                            setEndMonthYear(null);
                                            requestAnimationFrame(() => searchFilterRef.current?.focus());
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
                                                inputReadOnly={true}
                                                onChange={(date) => {
                                                    setStartMonthYear(date);
                                                    requestAnimationFrame(() => searchFilterRef.current?.focus());
                                                }}
                                                onKeyDown={handleSearchKeyDown}
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
                                                inputReadOnly={true}
                                                onChange={(date) => {
                                                    setEndMonthYear(date);
                                                    requestAnimationFrame(() => searchFilterRef.current?.focus());
                                                }}
                                                onKeyDown={handleSearchKeyDown}
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
                                    ชั่วโมงรวม {Math.floor(moment.duration(totalHours, 'minutes').asHours())} ชั่วโมง {moment.duration(totalHours, 'minutes').minutes() === 0 ? '' : `${moment.duration(totalHours, 'minutes').minutes()} นาที `}จำนวนเงิน {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: "15px", maxWidth: "100%", overflowX: "auto" }}>
                        <div style={{ minWidth: "1200px" }}>
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
                    </div>

                </Card.Body>
            </Card>

        </div>
    );
};

export default Compensation;