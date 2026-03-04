import { useState, useEffect } from 'react';
import { Card, Button as ButtonBootstrap } from 'react-bootstrap';
import { DatePicker, Select, Form, Input, Modal, Row, Col, Button } from 'antd';
import { SearchToolBtnBootstrap, ClearToolBtnBootstrap, AddToolBtnBootstrap, EditToolBtnBootstrap, DeleteToolBtn, Approve_RejectBtn, CloseModalBtnBootstrap, CloseIconBtn, ApproveModalBtnBootstrap, RejectModalBtnBootstrap, ExportToolBtnBootstrap } from '../../Utilities/Buttons/Buttons';
import { RejectTag, ApproveTag, PendingApproveTag } from "../../Utilities/StatusTag/StatusTag";
import TokenService from '../../../services/token.service';
import TableUI from '../../Utilities/Table/TableUI';
import { getDropdown } from '../../../services/dropdown.service';
import { noticeShowMessage } from '../../Utilities/Notification';
import Loading from "../../Utilities/Loading";
import { getCompensation } from '../../../services/Compensation.service';
import moment from 'moment';

const { Option } = Select;

const Compensation = () => {
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
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

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
                start_date: startDate ? startDate.format('YYYY-MM-DD') : null,
                end_date: endDate ? endDate.format('YYYY-MM-DD') : null
            };
            const res = await getCompensation.get_compensation(payload);
            if (res && res.data) {
                setDataSource(res.data);
            } else {
                setDataSource([]);
            }
        } catch (error) {
            console.error("Error fetching compensation data", error);
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
        }
    }

    useEffect(() => {
        fetchDropdowns();
        fetchData();
    }, []);

    const handleSearch = () => {
        fetchData();
    };

    const handleClear = () => {
        setSearchText("");
        setTeam("ทั้งหมด");
        setStartDate(null);
        setEndDate(null);

        // Fetch original
        setLoading(true);
        getCompensation.get_compensation({}).then(res => {
            if (res && res.data) setDataSource(res.data);
            else setDataSource([]);
        }).catch(err => {
            console.error(err);
            setDataSource([]);
        }).finally(() => setLoading(false));
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
                                        onChange={(val) => setTeam(val)}
                                        style={{ width: 150 }}
                                    >
                                        <Option value="ทั้งหมด">ทั้งหมด</Option>
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
                                            onChange={(date) => setEndDate(date)}
                                            disabledDate={(current) => {
                                                return startDate ? current && current < startDate.startOf('day') : false;
                                            }}
                                            style={{ width: 130 }}
                                            format="DD/MM/YYYY"
                                            placeholder="DD/MM/YYYY"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Buttons and Mockup Text */}
                            <div className="d-flex flex-column align-items-lg-end gap-2 mt-2 mt-lg-0">
                                <div className="d-flex align-items-center gap-2">
                                    <SearchToolBtnBootstrap onClick={handleSearch} />
                                    <ClearToolBtnBootstrap onClick={handleClear} />
                                    <ExportToolBtnBootstrap onClick={null} />
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