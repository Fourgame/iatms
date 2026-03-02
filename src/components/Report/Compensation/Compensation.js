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
            dataIndex: 'totalHours',
            key: 'totalHours',
            align: 'center',
            sorter: (a, b) => {
                const aVal = parseFloat((a.totalHours || "").toString().replace(/,/g, '')) || 0;
                const bVal = parseFloat((b.totalHours || "").toString().replace(/,/g, '')) || 0;
                return aVal - bVal;
            },
        },
        {
            title: 'จำนวนเงิน (บาท)',
            dataIndex: 'amount',
            key: 'amount',
            align: 'center',
            sorter: (a, b) => {
                const aVal = parseFloat((a.amount || "").toString().replace(/,/g, '')) || 0;
                const bVal = parseFloat((b.amount || "").toString().replace(/,/g, '')) || 0;
                return aVal - bVal;
            },
        },
    ];


    return (
        <div style={{ paddingLeft: '20px', paddingRight: '20px', paddingBottom: '40px', backgroundColor: '#e9ecef', minHeight: '80vh' }}>
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
                    <div style={{ background: "white",  borderRadius: "6px" }}>
                        <div className="d-flex flex-wrap flex-lg-nowrap justify-content-between align-items-start gap-3">
                            {/* Left Side: Filter Fields */}
                            <div className="d-flex flex-wrap align-items-center gap-4">
                                {/* ชื่อ-นามสกุลหรือ OA User */}
                                <div className="d-flex align-items-center gap-2">
                                    <span style={{ fontWeight: 700, fontSize: '16px' }}>ชื่อ-นามสกุลหรือ OA User :</span>
                                    <Input
                                        placeholder="กรอกชื่อ-นามสกุลหรือ OA User"
                                        value={null}
                                        onChange={null}
                                        style={{ width: 250 }}
                                    />
                                </div>

                                {/* Team */}
                                <div className="d-flex align-items-center gap-2">
                                    <span style={{ fontWeight: 700, fontSize: '16px' }}>Team :</span>
                                    <Select
                                        placeholder="ทั้งหมด"
                                        value={null}
                                        onChange={null}
                                        style={{ width: 150 }}
                                        allowClear
                                    >
                                        <Option value={null}>ทั้งหมด</Option>
                                    </Select>
                                </div>

                                {/* วันที่ */}
                                <div className="d-flex align-items-center gap-2">
                                    <span style={{ fontWeight: 700, fontSize: '16px' }}>วันที่ :</span>
                                    <div style={{ position: 'relative', marginTop: '4px' }}>
                                        <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '11px', color: '#888', zIndex: 1 }}>Start Date</span>
                                        <DatePicker style={{ width: 130 }} format="DD/MM/YYYY" placeholder="DD/MM/YYYY" />
                                    </div>
                                    <span>-</span>
                                    <div style={{ position: 'relative', marginTop: '4px' }}>
                                        <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '11px', color: '#888', zIndex: 1 }}>End Date</span>
                                        <DatePicker style={{ width: 130 }} format="DD/MM/YYYY" placeholder="DD/MM/YYYY" />
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Buttons and Mockup Text */}
                            <div className="d-flex flex-column align-items-lg-end gap-2 mt-2 mt-lg-0">
                                {/* Buttons */}
                                <div className="d-flex align-items-center gap-2">
                                    <SearchToolBtnBootstrap onClick={null} />
                                    <ClearToolBtnBootstrap onClick={null} />
                                    <ExportToolBtnBootstrap onClick={null} />
                                </div>

                                {/* Mockup Text */}
                                <div style={{
                                    background: "#DEE8FF",
                                    padding: "6px 15px",
                                    borderRadius: "4px",
                                    border: "1px solid #c9d8fa",
                                    fontWeight: 600,
                                    color: "#333",
                                    fontSize: "14px"
                                }}>
                                    ชั่วโมงรวม 174 ชั่วโมง จำนวนเงิน 18,500 บาท
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: "15px" }}>
                        <TableUI
                            columns={columns}
                            dataSource={[]}
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