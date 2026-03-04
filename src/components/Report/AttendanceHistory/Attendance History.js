import { useState, useEffect } from 'react';
import { Card, Button as ButtonBootstrap } from 'react-bootstrap';
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

const { Option } = Select;

const AttendanceHistory = () => {
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

        // refetch with cleared params
        setTimeout(() => handleSearch(), 0);
    };

    useEffect(() => {
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
                    <div style={{ background: "white", borderRadius: "6px" }}>
                        <div className="row">
                            <div className="col-lg-9 col-md-12">
                                {/* Row 1 fields */}
                                <div className="d-flex align-items-center flex-wrap gap-4 mb-3">
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

                                    {/* สถานะเวลา */}
                                    <div className="d-flex align-items-center gap-2">
                                        <span style={{ fontWeight: 700, fontSize: '16px' }}>สถานะเวลา:</span>
                                        <div style={{ position: 'relative', marginTop: '4px' }}>
                                            <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '11px', color: '#888', zIndex: 1 }}>Check-In</span>
                                            <Select 
                                            value={ciTimeStatus} 
                                            onChange={(val) => setCiTimeStatus(val)} 
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
                                            <Select value={coTimeStatus} onChange={(val) => setCoTimeStatus(val)} placeholder="ทั้งหมด" style={{ width: 110 }} >
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
                                            <Select value={ciLocationStatus} onChange={(val) => setCiLocationStatus(val)} placeholder="ทั้งหมด" style={{ width: 110 }} >
                                                <Option value="ทั้งหมด">ทั้งหมด</Option>
                                                {correctZoneList.map((item, idx) => (
                                                    <Option key={idx} value={item.value}>{item.label}</Option>
                                                ))}
                                            </Select>
                                        </div>
                                        <div style={{ position: 'relative', marginTop: '4px' }}>
                                            <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '11px', color: '#888', zIndex: 1 }}>Check-Out</span>
                                            <Select value={coLocationStatus} onChange={(val) => setCoLocationStatus(val)} placeholder="ทั้งหมด" style={{ width: 110 }} >
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
                                            onChange={(val) => setTeam(val)}
                                            style={{ width: 150 }}
                                            
                                        >
                                            <Option value={null}>ทั้งหมด</Option>
                                            {teamList.map((t, idx) => (
                                                <Option key={idx} value={t.value}>{t.label}</Option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                {/* Row 2 fields */}
                                <div className="d-flex align-items-center flex-wrap gap-4">
                                    <div className="d-flex align-items-center gap-2">
                                        <span style={{ fontWeight: 700, fontSize: '16px' }}>ชื่อ-นามสกุลหรือ OA User :</span>
                                        <Input
                                            placeholder="กรอกชื่อ-นามสกุลหรือ OA User"
                                            value={searchText}
                                            onChange={(e) => setSearchText(e.target.value)}
                                            style={{ width: 250 }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="col-lg-3 col-md-12 d-flex justify-content-lg-end align-items-start gap-2 mt-3 mt-lg-0">
                                <SearchToolBtnBootstrap onClick={handleSearch} />
                                <ClearToolBtnBootstrap onClick={handleClear} />
                                <ExportToolBtnBootstrap onClick={null} />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: "15px" }}>
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

                </Card.Body>
            </Card>

        </div>
    );
};

export default AttendanceHistory;