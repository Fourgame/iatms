import React, { useEffect, useState } from "react";
import { getLov } from "../../services/Lov.service";
import TableUI from "../Utilities/TableTennis";
import { Button, Tag, Input } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import { SearchOutlined, ClearOutlined, PrinterOutlined } from '@ant-design/icons';

import Modal from "./Modal";

const Listofvalues = () => {
    const [lov, setLov] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [keyword, setKeyword] = useState("");

    const handleAdd = () => {
        setModalTitle("Add - Manage List of Values");
        setSelectedRecord(null);
        setIsModalOpen(true);
        console.log("ADD - Modal Opened");
    };


    const columns = [
        {
            title: "Field Name",
            dataIndex: "fieldName",
            key: "fieldName",
            align: "left",
            sorter: (a, b) => String(a.fieldName ?? "").localeCompare(String(b.fieldName ?? "")),
            render: (text) => <div>{text ? text : "-"}</div>,
        },
        {
            title: "Code",
            dataIndex: "code",
            key: "code",
            align: "center",
            sorter: (a, b) => String(a.code ?? "").localeCompare(String(b.code ?? "")),
            render: (text) => <div>{text ? text : "-"}</div>,
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            align: "left",
            sorter: (a, b) => String(a.description ?? "").localeCompare(String(b.description ?? "")),
            render: (text) => (
                <div style={{ textAlign: text ? "left" : "center" }}>{text ? text : "-"}</div>
            ),
        },
        {
            title: "Condition",
            dataIndex: "condition",
            key: "condition",
            align: "left",
            sorter: (a, b) => String(a.condition ?? "").localeCompare(String(b.condition ?? "")),
            render: (text) => (
                <div style={{ textAlign: text ? "left" : "center" }}>{text ? text : "-"}</div>
            ),
        },
        {
            title: "Order",
            dataIndex: "orderIndex",
            key: "orderIndex",
            align: "right",
            sorter: (a, b) => Number(a.orderIndex ?? 0) - Number(b.orderIndex ?? 0),
            render: (val) => <div>{val ?? "-"}</div>,
        },
        {
            title: "Active",
            dataIndex: "isActive",
            key: "isActive",
            align: "center",
            sorter: (a, b) => Number(!!a.isActive) - Number(!!b.isActive),
            render: (val) => (
                <Tag
                    style={{
                        backgroundColor: val ? "#198754" : "#DC3545",
                        color: "white",
                        borderRadius: "20px",
                        minWidth: "80px",
                        textAlign: "center",
                        fontSize: "14px",
                        padding: "5px 10px",
                        border: "none",
                        fontWeight: "normal"
                    }}
                >
                    {val ? "ใช้งาน" : "ไม่ใช้งาน"}
                </Tag>
            ),
        },
    ];

    const actionColumn = {
        title: (
            <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                style={{ background: "#11A761", borderColor: "#11A761", color: "#ffffffff" }} // ให้โทนเหลืองแบบรูป
            >
                Add
            </Button>
        ),
        key: "actions",
        dataIndex: "actions",
        align: "center",
        width: 90,
        fixed: "left",
        render: (_, record) => (
            <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                style={{ background: "#faad14", borderColor: "#faad14", color: "#000" }} // ให้โทนเหลืองแบบรูป
            >
                Edit
            </Button>
        ),
    };


    const columnsWithActions = [actionColumn, ...columns];

    const fetchData = (searchKeyword) => {
        let payload = {
            keyword: typeof searchKeyword === "string" ? searchKeyword : (keyword || "")
        }

        getLov.get_lov(payload).then(
            (response) => {
                setLov(response.data);
            },
            (error) => {
                if (error.response.status === 403) {
                    //toast.error("Access Denied.");
                }
            }
        );
    };



    const handleEdit = (record) => {
        setModalTitle("Edit - Manage List of Values");
        setSelectedRecord(record);
        console.log("EDIT", record);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSaveModal = () => {
        console.log("Saving... and Refreshing");
        setIsModalOpen(false);
        fetchData(); // Refresh data table
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div style={{ margin: "0 12px 12px" }}> {/* ✅ ซ้าย-ขวา 12px */}
            {/* PANEL เดียวครอบทั้ง Search + Table */}
            <div
                style={{
                    borderRadius: "6px",
                    overflow: "hidden",
                    boxShadow: "0px 4px 4px rgba(0,0,0,0.25)", // เงา
                    background: "#fff",
                }}
            >
                {/* Search Header */}
                <div
                    style={{
                        backgroundColor: "#A0BDFF",
                        padding: "14px 20px",
                        fontSize: "22px",
                        fontWeight: 600,
                        color: "black",
                        border: "1px solid #d9d9d9",
                        borderBottom: "none", // ✅ ต่อกับส่วนด้านล่าง
                    }}
                >
                    Search
                </div>

                {/* Search Form Row */}
                <div
                    style={{
                        padding: "12px 15px",
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "10px",
                        background: "white",
                        borderLeft: "1px solid #d9d9d9",
                        borderRight: "1px solid #d9d9d9",
                        borderBottom: "none", // ✅ ให้เส้นบนของ table เป็นเส้นเดียว ไม่ซ้อน
                    }}
                >
                    <span style={{ fontWeight: 700 }}>Keyword:</span>
                    <Input
                        placeholder="กรอก Field Name, Code, Description, Condition, Order, สถานะ"
                        style={{ width: "400px" }}
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />

                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        style={{ background: "#00c0ef", borderColor: "#00c0ef" }}
                        onClick={fetchData}
                    >
                        Search
                    </Button>

                    <Button
                        icon={<ClearOutlined />}
                        onClick={() => {
                            setKeyword("");
                            fetchData("");
                        }}
                    >
                        Clear
                    </Button>

                    <Button icon={<PrinterOutlined />} style={{ marginLeft: "auto" }} />
                </div>

                {/* Table อยู่ใน panel เดียวกัน */}
                <div>
                    <TableUI
                        dataSource={lov || []}
                        columns={columnsWithActions}
                        rowKey={(r) => `${r.fieldName}__${r.code}`}
                        pagination={true}
                        bordered={true}
                        size={"small"}
                    />
                </div>
            </div>

            {/* Modal อยู่นอก panel ได้ตามเดิม */}
            <Modal
                show={isModalOpen}
                title={modalTitle}
                data={selectedRecord}
                existingData={lov || []}
                onClose={handleCloseModal}
                onSave={handleSaveModal}
            />
        </div>
    );
};

export default Listofvalues;