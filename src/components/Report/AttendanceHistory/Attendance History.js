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

const AttendanceHistory = () => {
    const columns = [
        {
            title: 'วันที่',
            dataIndex: 'date',
            key: 'date',
            align: 'center',
            sorter: (a, b) => (a.date || "").localeCompare(b.date || ""),

        },
        {
            title: 'OA user',
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
            title: 'Check-in',
            children: [
                {
                    title: 'เวลา (น.)',
                    dataIndex: 'checkInTime',
                    key: 'checkInTime',
                    align: 'center',
                    sorter: (a, b) => (a.checkInTime || "").localeCompare(b.checkInTime || ""),

                },
                {
                    title: 'สถานะเวลา',
                    dataIndex: 'checkInTimeStatus',
                    key: 'checkInTimeStatus',
                    align: 'center',
                    sorter: (a, b) => (a.checkInTimeStatus || "").localeCompare(b.checkInTimeStatus || ""),

                },
                {
                    title: 'ตำแหน่ง',
                    dataIndex: 'checkInLocation',
                    key: 'checkInLocation',
                    align: 'center',
                    sorter: (a, b) => (a.checkInLocation || "").localeCompare(b.checkInLocation || ""),

                },
                {
                    title: 'สถานะตำแหน่ง',
                    dataIndex: 'checkInLocationStatus',
                    key: 'checkInLocationStatus',
                    align: 'center',
                    sorter: (a, b) => (a.checkInLocationStatus || "").localeCompare(b.checkInLocationStatus || ""),

                },
                {
                    title: 'เหตุผล',
                    dataIndex: 'checkInReason',
                    key: 'checkInReason',
                    align: 'center',
                    sorter: (a, b) => (a.checkInReason || "").localeCompare(b.checkInReason || ""),


                },
            ],
        },
        {
            title: 'Check-out',
            children: [
                {
                    title: 'เวลา (น.)',
                    dataIndex: 'checkOutTime',
                    key: 'checkOutTime',
                    align: 'center',
                    sorter: (a, b) => (a.checkOutTime || "").localeCompare(b.checkOutTime || ""),
                },
                {
                    title: 'สถานะเวลา',
                    dataIndex: 'checkOutTimeStatus',
                    key: 'checkOutTimeStatus',
                    align: 'center',
                    sorter: (a, b) => (a.checkOutTimeStatus || "").localeCompare(b.checkOutTimeStatus || ""),

                },
                {
                    title: 'ตำแหน่ง',
                    dataIndex: 'checkOutLocation',
                    key: 'checkOutLocation',
                    align: 'center',
                    sorter: (a, b) => (a.checkOutLocation || "").localeCompare(b.checkOutLocation || ""),

                },
                {
                    title: 'สถานะตำแหน่ง',
                    dataIndex: 'checkOutLocationStatus',
                    key: 'checkOutLocationStatus',
                    align: 'center',
                    sorter: (a, b) => (a.checkOutLocationStatus || "").localeCompare(b.checkOutLocationStatus || ""),

                },
                {
                    title: 'เหตุผล',
                    dataIndex: 'checkOutReason',
                    key: 'checkOutReason',
                    align: 'center',
                    sorter: (a, b) => (a.checkOutReason || "").localeCompare(b.checkOutReason || ""),

                },
            ],
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
                <Card.Body>
                    <div style={{ background: "white",borderRadius: "6px" }}>
                        <div className="row">
                            <div className="col-lg-9 col-md-12">
                                {/* Row 1 fields */}
                                <div className="d-flex align-items-center flex-wrap gap-4 mb-3">
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

                                    {/* สถานะเวลา */}
                                    <div className="d-flex align-items-center gap-2">
                                        <span style={{ fontWeight: 700, fontSize: '16px' }}>สถานะเวลา:</span>
                                        <div style={{ position: 'relative', marginTop: '4px' }}>
                                            <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '11px', color: '#888', zIndex: 1 }}>Check-In</span>
                                            <Select placeholder="ทั้งหมด" style={{ width: 110 }} allowClear>
                                                <Option value="ทั้งหมด">ทั้งหมด</Option>
                                            </Select>
                                        </div>
                                        <div style={{ position: 'relative', marginTop: '4px' }}>
                                            <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '11px', color: '#888', zIndex: 1 }}>Check-Out</span>
                                            <Select placeholder="ทั้งหมด" style={{ width: 110 }} allowClear>
                                                <Option value="ทั้งหมด">ทั้งหมด</Option>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* สถานะตำแหน่ง */}
                                    <div className="d-flex align-items-center gap-2">
                                        <span style={{ fontWeight: 700, fontSize: '16px' }}>สถานะตำแหน่ง:</span>
                                        <div style={{ position: 'relative', marginTop: '4px' }}>
                                            <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '11px', color: '#888', zIndex: 1 }}>Check-In</span>
                                            <Select placeholder="ทั้งหมด" style={{ width: 110 }} allowClear>
                                                <Option value="ทั้งหมด">ทั้งหมด</Option>
                                            </Select>
                                        </div>
                                        <div style={{ position: 'relative', marginTop: '4px' }}>
                                            <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '11px', color: '#888', zIndex: 1 }}>Check-Out</span>
                                            <Select placeholder="ทั้งหมด" style={{ width: 110 }} allowClear>
                                                <Option value="ทั้งหมด">ทั้งหมด</Option>
                                            </Select>
                                        </div>
                                    </div>

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
                                </div>

                                {/* Row 2 fields */}
                                <div className="d-flex align-items-center flex-wrap gap-4">                     
                                    <div className="d-flex align-items-center gap-2">
                                        <span style={{ fontWeight: 700, fontSize: '16px' }}>ชื่อ-นามสกุลหรือ OA User :</span>
                                        <Input
                                            placeholder="กรอกชื่อ-นามสกุลหรือ OA User"
                                            value={null}
                                            onChange={null}
                                            style={{ width: 250 }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="col-lg-3 col-md-12 d-flex justify-content-lg-end align-items-start gap-2 mt-3 mt-lg-0">
                                <SearchToolBtnBootstrap onClick={null} />
                                <ClearToolBtnBootstrap onClick={null} />
                                <ExportToolBtnBootstrap onClick={null} />
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

export default AttendanceHistory;