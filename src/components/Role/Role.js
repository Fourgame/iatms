import React, { useState, useEffect } from 'react';
import { Button, Tag, Modal, Form, Input, Checkbox, Row, Col, Space } from 'antd';
import { CheckOutlined, CloseOutlined, EditOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import TableUI from '../Utilities/Table/TableUI';
import RoleService from '../../services/role.service';
import token from '../../services/token.service';
import Title from '../Utilities/Title';
import Loading from '../Utilities/Loading';
import { noticeShowMessage } from '../Utilities/Notification';
import { useNavigate } from 'react-router-dom';
const Role = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentRole, setCurrentRole] = useState(null);
    const [roleData, setRoleData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    useEffect(() => {
        document.title = Title.get_title("Define Roles");
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const currentUser = token.getUser();
            if (!currentUser) {
                token.deleteUser();
                return navigate("/signin", { state: { message: "token not found" } });
            }
            const response = await RoleService.getRole();
            if (response.data) {
                const dataWithKeys = response.data.map((item, index) => ({
                    ...item,
                    key: item.role_id || index
                }));
                setRoleData(dataWithKeys);
            }
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                if (status === 401) {
                    token.deleteUser();
                    return navigate("/signin", { state: { message: "session expire" } });
                }
                if (status === 403) return noticeShowMessage("access-denied", true);
                if (status === 404) return noticeShowMessage("not-found", true);

            } else if (error.request) {
                console.log("No response received:", error.request);
                return noticeShowMessage("network-error", true);

            } else {
                console.log("Error setting up request:", error.message);
                return noticeShowMessage("error", true);
            }
        } finally {
            setLoading(false);
        }
    };
    const showAddModal = () => {
        setModalMode('add');
        setCurrentRole(null);
        form.resetFields();
        form.setFieldsValue({
            status: true,
            menu: [],
            function: []
        });
        setIsModalOpen(true);
    };

    const showEditModal = (record) => {
        setModalMode('edit');
        setCurrentRole(record);

        const menuValues = [];
        if (record.menu_attendance) menuValues.push('attendance');
        if (record.menu_report) menuValues.push('report');
        if (record.menu_admin) menuValues.push('administrator');
        if (record.menu_setup) menuValues.push('setup');
        const functionValues = [];
        if (record.func_cico) functionValues.push('checkInOut');
        if (record.func_approve) functionValues.push('attendanceApproval');
        if (record.func_rp_attendance) functionValues.push('attendanceHistory');
        if (record.func_rp_work_hours) functionValues.push('workHours');
        if (record.func_rp_compensation) functionValues.push('compensation');
        form.setFieldsValue({
            role: record.role_id,
            description: record.description,
            roleLevel: record.role_level,
            status: record.is_active,
            menu: menuValues,
            function: functionValues
        });
        setIsModalOpen(true);
    };

    const menu = Form.useWatch('menu', form);

    useEffect(() => {
        if (menu) {
            const currentFunctions = form.getFieldValue('function') || [];
            let newFunctions = [...currentFunctions];
            if (!menu.includes('attendance')) {
                newFunctions = newFunctions.filter(f => f !== 'checkInOut' && f !== 'attendanceApproval');
            }
            if (!menu.includes('report')) {
                newFunctions = newFunctions.filter(f => f !== 'attendanceHistory' && f !== 'workHours' && f !== 'compensation');
            }
            if (currentFunctions.length !== newFunctions.length) {
                form.setFieldValue('function', newFunctions);
            }
        }
    }, [menu, form]);
    const handleOk = () => {
        form.validateFields().then(async (values) => {
            setLoading(true);
            try {
                const roleId = modalMode === 'add' ? values.role : currentRole.role_id;
                const currentUser = token.getUser();
                if (!currentUser) {
                    token.deleteUser();
                    return navigate("/signin", { state: { message: "token not found" } });
                }
                const username = currentUser?.username || "System";
                const payload = {
                    role_id: roleId,
                    description: values.description,
                    role_level: parseInt(values.roleLevel, 10),
                    menu_attendance: values.menu ? values.menu.includes('attendance') : false,
                    menu_report: values.menu ? values.menu.includes('report') : false,
                    menu_admin: values.menu ? values.menu.includes('administrator') : false,
                    menu_setup: values.menu ? values.menu.includes('setup') : false,
                    func_approve: values.function ? values.function.includes('attendanceApproval') : false,
                    func_cico: values.function ? values.function.includes('checkInOut') : false,
                    func_rp_attendance: values.function ? values.function.includes('attendanceHistory') : false,
                    func_rp_work_hours: values.function ? values.function.includes('workHours') : false,
                    func_rp_compensation: values.function ? values.function.includes('compensation') : false,
                    is_active: values.status,
                    username: username
                };

                const response = await RoleService.postRole(payload);

                if (response.status === 200 || response.data?.res_code === 200) {
                    noticeShowMessage(modalMode === 'add' ? "เพิ่ม Role สำเร็จ" : "แก้ไข Role สำเร็จ", false);
                    setIsModalOpen(false);
                    fetchRoles();
                } else {
                    noticeShowMessage(response.data?.message || "บันทึกข้อมูลไม่สำเร็จ", true);
                }
            } catch (error) {
                if (error.response) {
                    const status = error.response.status;
                    if (status === 401) {
                        token.deleteUser();
                        return navigate("/signin", { state: { message: "session expire" } });
                    }
                    if (status === 403) return noticeShowMessage("access-denied", true);
                    if (status === 404) return noticeShowMessage("not-found", true);

                } else if (error.request) {
                    console.log("No response received:", error.request);
                    return noticeShowMessage("network-error", true);

                } else {
                    console.log("Error setting up request:", error.message);
                    return noticeShowMessage("error", true);
                }
            } finally {
                setLoading(false);
            }
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const columns = [
        {
            title: (
                <Button
                    type="primary"
                    style={{ backgroundColor: '#198754', borderColor: '#198754' }}
                    icon={<PlusOutlined />}
                    onClick={showAddModal}
                >
                    Add
                </Button>
            ),
            key: 'action',
            width: 100,
            render: (record) => (
                <Button
                    style={{ backgroundColor: '#ffc107', borderColor: '#ffc107', color: 'black', fontWeight: '500' }}
                    icon={<EditOutlined />}
                    onClick={() => showEditModal(record)}
                >
                    Edit
                </Button>
            ),
            align: 'center',
        },
        {
            title: 'Role',
            dataIndex: 'role_id',
            key: 'role_id',
            SortName: 'role_id',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            SortName: 'description',
        },
        {
            title: 'Role Level',
            dataIndex: 'role_level',
            key: 'role_level',
            SortName: 'role_level',
            align: 'center',
        },
        {
            title: 'สถานะ',
            dataIndex: 'is_active',
            key: 'is_active',
            SortName: 'is_active',
            render: (status) => (
                <Tag color={status ? "#198754" : "#dc3545"} style={{ fontSize: '14px', padding: '5px 15px', borderRadius: '15px' }}>
                    {status ? "ใช้งาน" : "ไม่ใช้งาน"}
                </Tag>
            ),
            align: 'center',
        },
        {
            title: 'Menu',
            children: [
                {
                    title: 'Attendance',
                    dataIndex: 'menu_attendance',
                    key: 'menu_attendance',
                    align: 'center',
                    render: (val) => val ? <CheckOutlined style={{ color: '#198754', fontSize: '18px' }} /> : <CloseOutlined style={{ color: '#dc3545', fontSize: '18px' }} />
                },
                {
                    title: 'Report',
                    dataIndex: 'menu_report',
                    key: 'menu_report',
                    align: 'center',
                    render: (val) => val ? <CheckOutlined style={{ color: '#198754', fontSize: '18px' }} /> : <CloseOutlined style={{ color: '#dc3545', fontSize: '18px' }} />
                },
                {
                    title: 'Administrator',
                    dataIndex: 'menu_admin',
                    key: 'menu_admin',
                    align: 'center',
                    render: (val) => val ? <CheckOutlined style={{ color: '#198754', fontSize: '18px' }} /> : <CloseOutlined style={{ color: '#dc3545', fontSize: '18px' }} />
                },
                {
                    title: 'Setup',
                    dataIndex: 'menu_setup',
                    key: 'menu_setup',
                    align: 'center',
                    render: (val) => val ? <CheckOutlined style={{ color: '#198754', fontSize: '18px' }} /> : <CloseOutlined style={{ color: '#dc3545', fontSize: '18px' }} />
                },
            ]
        },
        {
            title: 'Function',
            children: [
                {
                    title: 'Check-In & Check-Out',
                    dataIndex: 'func_cico',
                    key: 'func_cico',
                    align: 'center',
                    render: (val) => val ? <CheckOutlined style={{ color: '#198754', fontSize: '18px' }} /> : <CloseOutlined style={{ color: '#dc3545', fontSize: '18px' }} />
                },
                {
                    title: 'Attendance Approval',
                    dataIndex: 'func_approve',
                    key: 'func_approve',
                    align: 'center',
                    render: (val) => val ? <CheckOutlined style={{ color: '#198754', fontSize: '18px' }} /> : <CloseOutlined style={{ color: '#dc3545', fontSize: '18px' }} />
                },
                {
                    title: 'Attendance History',
                    dataIndex: 'func_rp_attendance',
                    key: 'func_rp_attendance',
                    align: 'center',
                    render: (val) => val ? <CheckOutlined style={{ color: '#198754', fontSize: '18px' }} /> : <CloseOutlined style={{ color: '#dc3545', fontSize: '18px' }} />
                },
                {
                    title: 'Work Hours',
                    dataIndex: 'func_rp_work_hours',
                    key: 'func_rp_work_hours',
                    align: 'center',
                    render: (val) => val ? <CheckOutlined style={{ color: '#198754', fontSize: '18px' }} /> : <CloseOutlined style={{ color: '#dc3545', fontSize: '18px' }} />
                },
                {
                    title: 'Compensation',
                    dataIndex: 'func_rp_compensation',
                    key: 'func_rp_compensation',
                    align: 'center',
                    render: (val) => val ? <CheckOutlined style={{ color: '#198754', fontSize: '18px' }} /> : <CloseOutlined style={{ color: '#dc3545', fontSize: '18px' }} />
                },
            ]
        }
    ];
    const tableProps = {
        columns: columns,
        dataSource: roleData,
        pagination: true,
        defaultPageSize: 20,
        bordered: true,
        size: "middle",
        // scroll: { x: 'max-content' },
        loading: loading
    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#e9ecef', minHeight: '80vh' }}>
            {loading && <Loading />}


            <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '5px' }}>
                <TableUI
                    {...tableProps}
                />
            </div>
            <Modal
                title={
                    <div style={{
                        backgroundColor: '#2b5cad',
                        color: 'white',
                        padding: '16px 24px',
                        margin: '-20px -24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}>
                        <span>{modalMode === 'add' ? 'Add - Role' : 'Edit - Role'}</span>
                    </div>
                }
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={null}
                width={800}
                styles={{ header: { padding: 0, borderBottom: 'none' }, body: { padding: '24px' }, content: { padding: 0, overflow: 'hidden' } }}
                closeIcon={<CloseOutlined style={{ color: 'white', fontSize: '18px' }} />}
            >
                <Form
                    form={form}
                    layout="horizontal"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    labelAlign="left"
                >
                    <Row gutter={24}>
                        <Col span={14}>
                            <Form.Item
                                style={{ fontWeight: 'bold' }}
                                name="role"
                                label="Role Name"
                                rules={[
                                    { required: true, message: 'กรอก Role Name' },
                                    {
                                        validator: (_, value) => {
                                            if (modalMode === 'add' && roleData.some(r => r.role_id === value)) {
                                                return Promise.reject(new Error('Role Name นี้มีอยู่แล้ว'));
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                {modalMode === 'add' ? (
                                    <Input placeholder="กรอก Role Name" />
                                ) : (
                                    <span style={{ fontWeight: 500 }}>{currentRole?.role_id}</span>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={10}>
                            <div style={{ display: 'flex', alignItems: 'center', height: '32px' }}>
                                <span style={{ marginRight: '8px' }}>สถานะ:</span>
                                <Form.Item name="status" valuePropName="checked" noStyle>
                                    <Checkbox>ใช้งาน</Checkbox>
                                </Form.Item>
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={14}>
                            <Form.Item
                                name="description"
                                label="Description"
                                style={{ fontWeight: 'bold' }}
                                rules={[{ required: true, message: 'กรอก Role Description' }]}
                            >
                                <Input placeholder="กรอก Role Description" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={14}>
                            <Form.Item
                                name="roleLevel"
                                label="Role Level"
                                style={{ fontWeight: 'bold' }}
                                rules={[
                                    { required: true, message: 'กรอก Role Level' },
                                    { pattern: /^[0-9]+$/, message: 'กรุณากรอกเฉพาะตัวเลข' }
                                ]}
                            >
                                <Input
                                    placeholder="กรอก Role Level"
                                    onKeyPress={(event) => {
                                        if (!/[0-9]/.test(event.key)) {
                                            event.preventDefault();
                                        }
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div style={{ borderBottom: '1px solid #f0f0f0', marginBottom: '16px' }}>
                        <h4 style={{ fontSize: '16px', marginBottom: '16px' }}>Menu</h4>
                    </div>

                    <Form.Item name="menu" wrapperCol={{ span: 24 }}>
                        <Checkbox.Group style={{ width: '100%' }}>
                            <Row>
                                <Col span={6}>
                                    <Checkbox value="attendance">Attendance</Checkbox>
                                </Col>
                                <Col span={6}>
                                    <Checkbox value="report">Report</Checkbox>
                                </Col>
                                <Col span={6}>
                                    <Checkbox value="administrator">Administrator</Checkbox>
                                </Col>
                                <Col span={6}>
                                    <Checkbox value="setup">Setup</Checkbox>
                                </Col>
                            </Row>
                        </Checkbox.Group>
                    </Form.Item>

                    <div style={{ borderBottom: '1px solid #f0f0f0', marginBottom: '16px', marginTop: '16px' }}>
                        <h4 style={{ fontSize: '16px', marginBottom: '16px' }}>Function</h4>
                    </div>

                    <Form.Item name="function" wrapperCol={{ span: 24 }}>
                        <Checkbox.Group style={{ width: '100%' }}>
                            <Row gutter={[0, 16]}>
                                <Col span={6}>
                                    <Checkbox value="checkInOut" disabled={!menu?.includes('attendance')}>Check-In & Check-Out</Checkbox>
                                </Col>
                                <Col span={6}>
                                    <Checkbox value="attendanceApproval" disabled={!menu?.includes('attendance')}>Attendance Approval</Checkbox>
                                </Col>
                                <Col span={6}>
                                    <Checkbox value="attendanceHistory" disabled={!menu?.includes('report')}>Attendance History</Checkbox>
                                </Col>
                                <Col span={6}>
                                    <Checkbox value="workHours" disabled={!menu?.includes('report')}>Work Hours</Checkbox>
                                </Col>
                                <Col span={6}>
                                    <Checkbox value="compensation" disabled={!menu?.includes('report')}>Compensation</Checkbox>
                                </Col>
                            </Row>
                        </Checkbox.Group>
                    </Form.Item>
                    <Row justify="center" style={{ marginTop: '24px' }}>
                        <Space size="large">
                            <Button
                                type="primary"
                                onClick={handleOk}
                                icon={<SaveOutlined />}
                                style={{ backgroundColor: '#aebbff', borderColor: '#aebbff', color: '#000', width: '150px', height: '40px', fontSize: '16px' }}
                            >
                                Save
                            </Button>
                            <Button
                                onClick={handleCancel}
                                icon={<CloseOutlined />}
                                style={{ backgroundColor: '#d3d3d3', borderColor: '#d3d3d3', color: '#000', width: '150px', height: '40px', fontSize: '16px' }}
                            >
                                Close
                            </Button>
                        </Space>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default Role;
