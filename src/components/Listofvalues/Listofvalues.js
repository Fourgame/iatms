import React, { useEffect, useState } from "react";
import "../Utilities/Table/Table.css";
import { getLov, postLov } from "../../services/lov.service";
import TableUI from "../Utilities/Table/TableUI";
import Loading from "../Utilities/Loading";
import { Button, Tag, Input, Alert, Modal, Form, Checkbox } from "antd";
import { Card } from 'react-bootstrap';
import { noticeShowMessage } from '../Utilities/Notification';
import { CloseIconBtn, SearchToolBtnBootstrap, ClearToolBtnBootstrap, AddToolBtnBootstrap, EditToolBtnBootstrap, CloseModalBtnBootstrap, SaveModalBtnBootstrap } from "../Utilities/Buttons/Buttons";

import { Navigate, useNavigate } from "react-router-dom";
import AuthService from "../../services/auth.service";
import TokenService from "../../services/token.service";



const EditModal = ({ show, onClose, onSave, title, data, existingData = [] }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (show) {
            setLoading(false);
            form.resetFields();

            if (data) {
                // Edit Mode
                form.setFieldsValue({
                    fieldName: data.fieldName || "",
                    code: data.code || "",
                    description: data.description || "",
                    condition: data.condition || "",
                    orderIndex: (data.orderIndex !== null && data.orderIndex !== undefined) ? String(data.orderIndex) : "",
                    isActive: data.isActive !== undefined ? data.isActive : true,
                });
            } else {
                // Add Mode
                form.setFieldsValue({
                    fieldName: "",
                    code: "",
                    description: "",
                    condition: "",
                    orderIndex: "",
                    isActive: true,
                });
            }
        }
    }, [show, data, form, existingData]);

    const handleSaveClick = async () => {

        try {
            const currentUser = TokenService.getUser();
            if (!currentUser) {
                TokenService.deleteUser();
                return navigate("/signin", { state: { message: "token not found" } });
            }
            const values = await form.validateFields();

            // Sanitize payload
            const payload = {
                ...values,
                orderIndex: (values.orderIndex === "" || values.orderIndex === null || values.orderIndex === undefined) ? null : parseInt(values.orderIndex),
                description: values.description === undefined || values.description === null ? "" : values.description,
                condition: values.condition === undefined || values.condition === null ? "" : values.condition,
            };

            setLoading(true);
            try {
                // Call API
                await postLov.post_lov(payload);

                // Show success message
                if (!data) {
                    noticeShowMessage("บันทึกข้อมูลสำเร็จ", false);
                } else {
                    noticeShowMessage("บันทึกข้อมูลสำเร็จ", false);
                }

                onSave(payload);
            } catch (err) {
                if (err.response.status === 401) {
                    TokenService.deleteUser();
                    navigate("/", { state: { message: "session expire" } })
                }
                const serverMessage = err.response?.data?.message || err.response?.data || err.message;
                noticeShowMessage(serverMessage || "เกิดข้อผิดพลาดในการบันทึกข้อมูล", true);
            } finally {
                setLoading(false);
            }
        } catch (info) {
        }
    };

    const isEditMode = !!data;

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
                    borderTopRightRadius: '8px'
                }}>
                    <span>{title}</span>
                </div>
            }
            open={show}
            onCancel={onClose}
            footer={null}
            width={600}
            styles={{ header: { padding: 0, borderBottom: 'none' }, body: { padding: '24px' }, content: { padding: 0, overflow: 'hidden', borderRadius: '8px' } }}
            closeIcon={<CloseIconBtn />}
            centered
        >
            {loading && <Loading />}

            <Form
                form={form}
                layout="horizontal"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                labelAlign="right"
                onValuesChange={(changedValues, allValues) => {
                    if (changedValues.fieldName) {
                        const duplicateLoadingCode = form.getFieldValue('code');
                        if (duplicateLoadingCode) {
                            form.validateFields(['code']);
                        }
                    }
                    if (changedValues.code) {
                        const duplicateLoadingFieldName = form.getFieldValue('fieldName');
                        if (duplicateLoadingFieldName) {
                            form.validateFields(['fieldName']);
                        }
                    }
                }}
            >
                {/* Field Name */}
                <Form.Item
                    name="fieldName"
                    label={<span className="fw-bold">Field Name</span>}
                    rules={[
                        { required: true, whitespace: true, message: 'กรอก Field Name' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!data && value) {
                                    const codeVal = getFieldValue('code');
                                    if (codeVal) {
                                        const isDuplicate = existingData.some(
                                            (item) => item.fieldName === value && item.code === codeVal
                                        );
                                        if (isDuplicate) {
                                            return Promise.reject(new Error(`มี Field Name: "${value}" และ Code: "${codeVal}" นี้ในระบบแล้ว`));
                                        }
                                    }
                                }
                                return Promise.resolve();
                            },
                        }),
                    ]}
                >
                    {isEditMode ? (
                        <span className="form-control-plaintext text-start" style={{ paddingLeft: '11px' }}>
                            {data.fieldName}
                        </span>
                    ) : (
                        <Input maxLength={50}
                            placeholder="กรอก File Name" onPressEnter={handleSaveClick} />
                    )}
                </Form.Item>

                {/* Code */}
                <Form.Item
                    name="code"
                    label={<span className="fw-bold">Code</span>}
                    rules={[
                        { required: true, whitespace: true, message: 'กรอก Code' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!data && value) {
                                    const fieldNameVal = getFieldValue('fieldName');
                                    if (fieldNameVal) {
                                        const isDuplicate = existingData.some(
                                            (item) => item.fieldName === fieldNameVal && item.code === value
                                        );
                                        if (isDuplicate) {
                                            return Promise.reject(new Error(`มี Field Name: "${fieldNameVal}" และ Code: "${value}" นี้ในระบบแล้ว`));
                                        }
                                    }
                                }
                                return Promise.resolve();
                            },
                        }),
                    ]}
                >
                    {isEditMode ? (
                        <span className="form-control-plaintext text-start" style={{ paddingLeft: '11px' }}>
                            {data.code}
                        </span>
                    ) : (
                        <Input maxLength={50} placeholder="กรอก Code" onPressEnter={handleSaveClick} />
                    )}
                </Form.Item>

                {/* Description */}
                <Form.Item
                    name="description"
                    label={<span className="fw-bold">Description</span>}
                >
                    <Input maxLength={255} placeholder="กรอก Description" onPressEnter={handleSaveClick} />
                </Form.Item>

                {/* Condition */}
                <Form.Item
                    name="condition"
                    label={<span className="fw-bold">Condition</span>}
                >
                    <Input.TextArea
                        maxLength={255}
                        rows={3}
                        placeholder="กรอก Condition"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSaveClick();
                            }
                        }}
                    />
                </Form.Item>

                {/* Order */}
                <Form.Item
                    name="orderIndex"
                    label={<span className="fw-bold">Order</span>}
                    rules={[
                        { required: true, whitespace: true, message: 'กรอก Order' },
                        {
                            validator: (_, value) => {
                                if (value) {
                                    if (value.startsWith('0')) {
                                        return Promise.reject(new Error('รูปแบบไม่ถูกต้อง ห้ามขึ้นต้นด้วย 0'));
                                    }
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                >
                    <Input
                        // type="number"
                        maxLength={5}
                        placeholder="กรอก Order"
                        onPressEnter={handleSaveClick}
                        onKeyPress={(event) => {
                            if (!/[0-9]/.test(event.key) && event.key !== 'Enter') {
                                event.preventDefault();
                            }
                        }}
                    />
                </Form.Item>

                {/* Status */}
                <Form.Item
                    name="isActive"
                    label={<span className="fw-bold">สถานะ</span>}
                    valuePropName="checked"
                >
                    <Checkbox
                        className="fw-bold"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveClick();
                            }
                        }}
                    >
                        ใช้งาน
                    </Checkbox>
                </Form.Item>
            </Form>

            {/* Footer */}
            <div className="modal-footer justify-content-center border-top-0 pb-0 pt-3">
                <SaveModalBtnBootstrap onClick={handleSaveClick} loading={loading} />
                <div style={{ width: "40px" }} />
                <CloseModalBtnBootstrap onClick={onClose} />
            </div>
        </Modal>
    );
};


const Listofvalues = () => {
    const navigate = useNavigate();
    const [lov, setLov] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [keyword, setKeyword] = useState("");


    const handleRequestError = (error) => {
        if (error.response) {
            const status = error.response.status;
            if (status === 401) {
                TokenService.deleteUser();
                navigate("/signin", { state: { message: "session expire" } });
                return true;
            }
            const messages = { 403: "access-denied", 404: "not-found" };
            noticeShowMessage(messages[status] || "error", true);
        } else if (error.request) {
            noticeShowMessage("network-error", true);
        } else {
            noticeShowMessage("error", true);
        }
        return false;
    };



    const handleAdd = () => {
        setModalTitle("Add - List of Value");
        setSelectedRecord(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setModalTitle("Edit - List of Value");
        setSelectedRecord(record);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const fetchData = async (searchKeyword) => {
        setLoading(true);
        try {
            const currentUser = TokenService.getUser();
            if (!currentUser) {
                TokenService.deleteUser();
                return navigate("/signin", { state: { message: "token not found" } });
            }

            let payload = {
                keyword: typeof searchKeyword === "string" ? searchKeyword : keyword || "",
            };

            const response = await getLov.get_lov(payload);
            setLov(response.data);
        } catch (error) {
            handleRequestError(error);
        } finally {
            setLoading(false);
        }
    };



    const handleSaveModal = () => {
        setIsModalOpen(false);
        fetchData();
    };

    const columns = [
        {
            title: "Field Name",
            dataIndex: "fieldName",
            key: "fieldName",
            align: "center",
            sorter: (a, b) => String(a.fieldName ?? "").localeCompare(String(b.fieldName ?? "")),
            render: (text) => (
                <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                    {text && text.trim() ? text : "-"}
                </div>
            ),
        },
        {
            title: "Code",
            dataIndex: "code",
            key: "code",
            align: "center",
            sorter: (a, b) => String(a.code ?? "").localeCompare(String(b.code ?? "")),
            render: (text) => (
                <div style={{ textAlign: text && text.trim() ? "center" : "center" }}>
                    {text && text.trim() ? text : "-"}
                </div>
            ),
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            align: "center",
            sorter: (a, b) =>
                String(a.description ?? "").localeCompare(String(b.description ?? "")),
            render: (text) => (
                <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                    {text && text.trim() ? text : "-"}
                </div>
            ),
        },
        {
            title: "Condition",
            dataIndex: "condition",
            key: "condition",
            align: "center",
            sorter: (a, b) => String(a.condition ?? "").localeCompare(String(b.condition ?? "")),
            render: (text) => (
                <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                    {text && text.trim() ? text : "-"}
                </div>
            ),
        },
        {
            title: "Order",
            dataIndex: "orderIndex",
            key: "orderIndex",
            align: "center",
            sorter: (a, b) => Number(a.orderIndex ?? 0) - Number(b.orderIndex ?? 0),
            render: (val) => {
                const hasValue = val !== null && val !== undefined && String(val).trim() !== "";
                return (
                    <div style={{ textAlign: hasValue ? "center" : "center" }}>
                        {hasValue ? val : "-"}
                    </div>
                );
            },
        },
        {
            title: "สถานะ",
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
                        fontWeight: "normal",
                    }}
                >
                    {val ? "ใช้งาน" : "ไม่ใช้งาน"}
                </Tag>
            ),
        },
    ];

    const actionColumn = {

        title: (
            <AddToolBtnBootstrap onClick={handleAdd} />
        ),
        key: "actions",
        dataIndex: "actions",
        align: "center",
        width: 90,
        fixed: "left",
        render: (_, record) => (
            <EditToolBtnBootstrap onClick={() => handleEdit(record)} />
        ),
    };

    const columnsWithActions = [actionColumn, ...columns];

    useEffect(() => {
        if (!TokenService.isSignIn()) {
            return navigate("/", { state: { message: "please login" } });

        } else {
            fetchData();
        }

    }, []);


    //     if (!TokenService.isSignIn()) {
    //     return navigate("/", { state: { message: "session expire 1" } });

    //   }



    return (
        <div style={{ paddingLeft: '20px', paddingRight: '20px', backgroundColor: '#e9ecef', minHeight: '80vh' }}>
            {loading && <Loading />}
            <Card
                className="shadow-sm border-0"
                style={{
                    borderRadius: "6px",
                    overflow: "hidden",
                    boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
                }}
            >
                {/* Search Header */}
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

                {/* Search Form Row */}
                <Card.Body className="p-0">
                    <div
                        style={{
                            padding: "12px 15px",
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "10px",
                            background: "white",
                        }}
                    >
                        <span style={{ fontWeight: 700 }}>Keyword:</span>
                        <Input
                            placeholder="กรอก Field Name, Code, Description, Condition, Order, สถานะ"
                            style={{ width: "400px", borderColor: "#969696" }}
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    fetchData();
                                }
                            }}
                        />

                        <SearchToolBtnBootstrap onClick={fetchData} style={{ marginLeft: "auto" }} />

                        <ClearToolBtnBootstrap
                            onClick={() => {
                                setKeyword("");
                                fetchData("");
                            }}

                        />

                    </div>

                    {/* Table */}
                    <div className="m-3">
                        <TableUI
                            dataSource={lov || []}
                            columns={columnsWithActions}
                            rowKey={(r) => `${r.fieldName}__${r.code}`}
                            pagination={true}
                            bordered={true}
                            size={"large"}
                        />
                    </div>
                </Card.Body>
            </Card>

            {/* Modal */}
            <EditModal
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
