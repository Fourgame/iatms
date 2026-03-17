import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import TokenService from '../../../services/token.service';
import { DatePicker, Select, Input } from 'antd';
import { SearchToolBtnBootstrap, ClearToolBtnBootstrap, ExportToolBtnBootstrap } from '../../Utilities/Buttons/Buttons';
import TableUI from '../../Utilities/Table/TableUI';
import { getDropdown } from '../../../services/dropdown.service';
import { noticeShowMessage } from '../../Utilities/Notification';
import Loading from "../../Utilities/Loading";
import { workHoursService } from '../../../services/workhours.service';
import moment from 'moment';
import * as XLSX from 'xlsx-js-style';
import Title from '../../Utilities/Title';

const { Option } = Select;

const WorkHours = ({ title }) => {
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

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [team, setTeam] = useState(null);
    const [searchText, setSearchText] = useState("");

    const [dataSource, setDataSource] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [teamList, setTeamList] = useState([]);
    const [totalHoursString, setTotalHoursString] = useState("รวมทั้งหมด 0 ชั่วโมง");

    const columns = [
        {
            title: 'วันที่',
            dataIndex: 'at_date',
            key: 'at_date',
            align: 'center',
            render: (text) => text || "-",
            sorter: (a, b) => (a.at_date || "").localeCompare(b.at_date || ""),
        },
        {
            title: 'OA User',
            dataIndex: 'oa_user',
            key: 'oa_user',
            align: 'center',
            sorter: (a, b) => (a.oa_user || "").localeCompare(b.oa_user || ""),
        },
        {
            title: 'ชื่อ-นามสกุล',
            dataIndex: 'full_name',
            key: 'full_name',
            align: 'left',
            sorter: (a, b) => (a.full_name || "").localeCompare(b.full_name || ""),
        },
        {
            title: 'Team',
            dataIndex: 'team_code',
            key: 'team_code',
            align: 'center',
            sorter: (a, b) => (a.team_code || "").localeCompare(b.team_code || ""),
        },
        {
            title: 'จำนวนชั่วโมง',
            dataIndex: 'workingHour',
            key: 'workingHour',
            align: 'center',
            render: (timeStr) => {
                const parts = timeStr.split(':');
                if (parts.length >= 2) {
                    const h = parseInt(parts[0], 10);
                    const m = parseInt(parts[1], 10);
                    return m > 0 ? `${h} ชั่วโมง ${m} นาที` : `${h} ชั่วโมง`;
                }
                return timeStr;
            },
            sorter: (a, b) => (a.workingHour || "").localeCompare(b.workingHour || ""),
        },
    ];

    useEffect(() => {
        document.title = Title.get_title(title);
        const fetchDropdowns = async () => {
            try {
                const teamRes = await getDropdown.get_dropdown({ type: 'Team' });
                if (teamRes && teamRes.data) setTeamList(teamRes.data);
            } catch (error) {
                console.error("Error fetching dropdowns:", error);
                handleRequestError(error);
            }
        };
        fetchDropdowns();
        fetchData({ clear: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filterData = (dataToFilter, searchVal) => {
        let filtered = dataToFilter;
        if (searchVal) {
            const lowerSearch = searchVal.toLowerCase();
            filtered = filtered.filter(item =>
                (item.full_name && item.full_name.toLowerCase().includes(lowerSearch)) ||
                (item.oa_user && item.oa_user.toLowerCase().includes(lowerSearch))
            );
        }
        setFilteredData(filtered);

        let totalMins = 0;
        filtered.forEach(item => {
            if (item.workingHour) {
                const parts = item.workingHour.split(':');
                if (parts.length >= 2) {
                    totalMins += parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
                }
            }
        });

        const hours = Math.floor(totalMins / 60);
        const mins = totalMins % 60;

        if (mins > 0) {
            setTotalHoursString(`${hours} ชั่วโมง ${mins} นาที`);
        } else {
            setTotalHoursString(`${hours} ชั่วโมง`);
        }
    };

    const fetchData = async (override) => {
        setLoading(true);
        try {
            const payload = {
                full_name: override?.clear ? null : (searchText || null),
                start_date: override?.clear ? null : (startDate ? startDate.format('YYYY-MM-DD') : null),
                end_date: override?.clear ? null : (endDate ? endDate.format('YYYY-MM-DD') : null),
                team_code: override?.clear ? null : (team === "ทั้งหมด" ? null : team),
            };

            const response = await workHoursService.getHourHistory(payload);
            let rawData = [];
            if (response && response.data) {
                rawData = response.data;
            }
            setDataSource(rawData);
            filterData(rawData, override?.clear ? "" : searchText);
        } catch (error) {
            console.error("Error fetching work hours:", error);
            handleRequestError(error);
            setDataSource([]);
            setFilteredData([]);
            setTotalHoursString("รวมทั้งหมด 0 ชั่วโมง");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => fetchData({ clear: false });

    const handleClear = () => {
        setStartDate(null);
        setEndDate(null);
        setTeam(null);
        setSearchText("");
        fetchData({ clear: true });
    };

    const handleExport = () => {
        if (!filteredData || filteredData.length === 0) {
            noticeShowMessage("ไม่มีข้อมูลสำหรับส่งออก", true);
            return;
        }

        const exportData = filteredData.map(item => {
            let workingHourDisplay = item.workingHour || "-";
            if (item.workingHour && item.workingHour !== "00:00:00") {
                const parts = item.workingHour.split(':');
                if (parts.length >= 2) {
                    const h = parseInt(parts[0], 10);
                    const m = parseInt(parts[1], 10);
                    workingHourDisplay = m > 0 ? `${h} ชั่วโมง ${m} นาที` : `${h} ชั่วโมง`;
                }
            } else if (item.workingHour === "00:00:00") {
                workingHourDisplay = "0";
            }

            return {
                "วันที่": item.at_date || "-",
                "OA User": item.oa_user || "-",
                "ชื่อ-นามสกุล": item.full_name || "-",
                "Team": item.team_code || "-",
                "จำนวนชั่วโมง": workingHourDisplay
            };
        });

        // Add Summary row at the bottom
        exportData.push({
            "วันที่": "จำนวนชั่วโมงรวม:",
            "OA User": "",
            "ชื่อ-นามสกุล": "",
            "Team": "",
            "จำนวนชั่วโมง": totalHoursString
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

        // Column widths
        worksheet['!cols'] = [
            { wch: 15 }, // วันที่
            { wch: 20 }, // OA User
            { wch: 30 }, // ชื่อ-นามสกุล
            { wch: 15 }, // Team
            { wch: 25 }, // จำนวนชั่วโมง
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
                    } else if (C === 4) {
                        worksheet[cell_ref].s.alignment.horizontal = "center";
                    }
                } else {
                    // Data Rows
                    if (C === 2 || C === 1) {
                        // ชื่อ-นามสกุล and OA User let's left align
                        worksheet[cell_ref].s.alignment.horizontal = "left";
                    } else {
                        // Others center align
                        worksheet[cell_ref].s.alignment.horizontal = "center";
                    }
                }
            }
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Work Hours");

        XLSX.writeFile(workbook, `Work_Hours_${moment().format("YYYYMMDD_HHmmss")}.xlsx`);
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
                                    <span style={{ fontWeight: 700, fontSize: '16px' }}>ชื่อ-นามสกุล หรือ OA User :</span>
                                    <Input
                                        placeholder="กรอกชื่อ-นามสกุลหรือ OA User"
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        onPressEnter={handleSearch}
                                        style={{ width: 250 }}
                                    />
                                </div>

                                {/* Team */}
                                <div className="d-flex align-items-center gap-2">
                                    <span style={{ fontWeight: 700, fontSize: '16px' }}>Team :</span>
                                    <Select
                                        placeholder="ทั้งหมด"
                                        value={team}
                                        onChange={(val) => setTeam(val)}
                                        style={{ width: 150 }}
                                        allowClear
                                    >
                                        <Option value={null}>ทั้งหมด</Option>
                                        {teamList.map((t, idx) => (
                                            <Option key={idx} value={t.value}>{t.label}</Option>
                                        ))}
                                    </Select>
                                </div>

                                {/* วันที่ */}
                                <div className="d-flex align-items-center gap-2">
                                    <span style={{ fontWeight: 700, fontSize: '16px' }}>วันที่ :</span>
                                    <div style={{ position: 'relative', marginTop: '4px' }}>
                                        <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '11px', color: '#888', zIndex: 1 }}>Start Date</span>
                                        <DatePicker
                                            value={startDate}
                                            onChange={(date) => setStartDate(date)}
                                            disabledDate={(current) => endDate ? current && current > endDate.endOf('day') : false}
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
                                            onChange={(date) => setEndDate(date)}
                                            disabledDate={(current) => startDate ? current && current < startDate.startOf('day') : false}
                                            style={{ width: 130 }}
                                            format="DD/MM/YYYY"
                                            placeholder="DD/MM/YYYY"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Buttons and Mockup Text */}
                            <div className="d-flex flex-column align-items-lg-end gap-2 mt-2 mt-lg-0">
                                {/* Buttons */}
                                <div className="d-flex align-items-center gap-2">
                                    <SearchToolBtnBootstrap onClick={handleSearch} />
                                    <ClearToolBtnBootstrap onClick={handleClear} />
                                    <ExportToolBtnBootstrap onClick={handleExport} />
                                </div>

                                {/* Total Hours Text */}
                                <div style={{
                                    background: "#DEE8FF",
                                    padding: "6px 15px",
                                    borderRadius: "4px",
                                    border: "1px solid #c9d8fa",
                                    fontWeight: 600,
                                    color: "#333",
                                    fontSize: "14px"
                                }}>
                                    {totalHoursString}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: "15px", maxWidth: "100%", overflowX: "auto" }}>
                        <div style={{ minWidth: "1200px" }}>
                            <TableUI
                                columns={columns}
                                dataSource={filteredData}
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

export default WorkHours;