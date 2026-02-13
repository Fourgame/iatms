import React, { useState, useEffect } from 'react';
import { Button, Input, Tag, Modal, Form, Select, Checkbox, Row, Col, Space, Card } from 'antd';
import { SearchOutlined, ClearOutlined, PlusOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import TableUI from '../Utilities/Table/TableUI';
import { getUserManage, postUserManage, getDropdown, findLdap } from '../../services/user-manage.service';
import TokenService from '../../services/token.service';
import { getLov } from '../../services/lov.service';
import Title from '../Utilities/Title';
import Loading from '../Utilities/Loading';
import { noticeShowMessage } from '../Utilities/Notification';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const UserManage = () => {
    // State
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentUser, setCurrentUser] = useState(null); // Used for Edit mode
    const [searchedUser, setSearchedUser] = useState({
        oa_user: "",
        first_name_th: "",
        last_name_th: "",
        first_name_en: "",
        last_name_en: "",
        email: "",
        division: ""
    }); // Used for Add mode
    const [form] = Form.useForm();

    // Search Inputs for Add Modal
    const [searchFnEn, setSearchFnEn] = useState('');
    const [searchLnEn, setSearchLnEn] = useState('');
    const [searchOa, setSearchOa] = useState('');

    // Dropdown Data
    const [roleList, setRoleList] = useState([]);
    const [workPlaceList, setWorkPlaceList] = useState([]);
    const [teamList, setTeamList] = useState([]);

    const navigate = useNavigate();
    useEffect(() => {
        document.title = Title.get_title("User Management");

        const initPage = async () => {
            setLoading(true);
            try {
                // ใช้ Promise.all รวมทุกอย่างที่ต้องโหลดตอนเปิดหน้า
                const [roleRes, workPlaceRes, teamRes, userRes] = await Promise.all([
                    getDropdown.get_dropdown({ type: 'Role' }),
                    getDropdown.get_dropdown({ type: 'WorkPlace' }),
                    getDropdown.get_dropdown({ type: 'Team' }),
                    getUserManage.get_user_manage({ Keyword: '' })
                ]);

                // Set Dropdowns
                if (roleRes.data) setRoleList(roleRes.data);
                if (workPlaceRes.data) setWorkPlaceList(workPlaceRes.data);
                if (teamRes.data) setTeamList(teamRes.data);

                // Set Users
                if (userRes.data) {
                    setUserData(userRes.data.map((item, index) => ({
                        ...item,
                        key: item.oa_user || index
                    })));
                }
            } catch (error) {
                handleRequestError(error);
            } finally {
                setLoading(false);
            }
        };

        initPage();
    }, []);

    // ฟังก์ชัน fetchUsers สำหรับปุ่ม Search (ใช้ ErrorHandler กลาง)
    const fetchUsers = async (searchKeyword) => {
        setLoading(true);
        try {
            const response = await getUserManage.get_user_manage({ Keyword: searchKeyword });
            setUserData(response.data?.map((item, index) => ({ ...item, key: item.oa_user || index })) || []);
        } catch (error) {
            handleRequestError(error);
        } finally {
            setLoading(false);
        }
    };
    const handleRequestError = (error) => {
        if (error.response) {
            const status = error.response.status;
            if (status === 401) {
                TokenService.deleteUser();
                navigate("/signin", { state: { message: "session expire" } });
                return true; // บอกว่าจัดการ redirect ไปแล้ว
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

    const handleSearch = () => {
        fetchUsers(keyword);
    };

    const handleClear = () => {
        setKeyword('');
        fetchUsers('');
    };

    // Modal Functions
    const showAddModal = () => {
        setModalMode('add');
        setCurrentUser(null);
        setSearchFnEn('');
        setSearchLnEn('');
        setSearchOa('');
        setSearchedUser({
            oa_user: "",
            first_name_th: "",
            last_name_th: "",
            first_name_en: "",
            last_name_en: "",
            email: "",
            division: ""
        });
        form.resetFields();
        form.setFieldsValue({
            is_active: true
        });
        setIsModalOpen(true);
    };

    const handleUserSearch = async () => {
        // 1. ตรวจสอบเงื่อนไขการค้นหา
        if (!searchFnEn && !searchLnEn && !searchOa) {
            noticeShowMessage("กรุณาระบุเงื่อนไขในการค้นหาอย่างน้อย 1 อย่าง", true);
            return;
        }

        setLoading(true);
        try {
            const currentUser = TokenService.getUser();
            if (!currentUser) {
                TokenService.deleteUser();
                return navigate("/signin", { state: { message: "token not found" } });
            }
            const response = await findLdap.find_ldap({
                oa_user: searchOa,
                fname: searchFnEn,
                lname: searchLnEn
            });

            if (response.data && response.data.res_code === 200) {
                const data = response.data.result;

                // 3. แยกชื่อ-นามสกุล (เนื่องจาก LDAP มักให้ Name รวมมา)
                const splitTh = data.name_th ? data.name_th.trim().split(/\s+/) : ["", ""];
                const splitEn = data.name_en ? data.name_en.trim().split(/\s+/) : ["", ""];

                // 4. อัปเดต State searchedUser เพื่อให้ Modal แสดงข้อมูล
                setSearchedUser({
                    oa_user: data.oa_user || "N/A",
                    first_name_th: splitTh[0] || "",
                    last_name_th: splitTh.slice(1).join(" ") || "", // เผื่อนามสกุลมีเว้นวรรค
                    first_name_en: splitEn[0] || "",
                    last_name_en: splitEn.slice(1).join(" ") || "",
                    email: data.email || "",
                    division: data.division_code || "" // ใส่ในช่อง "ส่วนงาน"
                });

                noticeShowMessage("ดึงข้อมูลจาก LDAP สำเร็จ", false);
            } else {
                noticeShowMessage("ไม่พบข้อมูลผู้ใช้งานในระบบ LDAP", true);
            }
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                if (status === 401) {
                    TokenService.deleteUser();
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

    const showEditModal = (record) => {
        setModalMode('edit');
        setCurrentUser(record);

        // Validate if values exist in dropdown lists
        // If the current value is not in the list (e.g. inactive), set to undefined to show placeholder
        const findValue = (list, val) => {
            const found = list.find(item => item.value === val || item.label === val);
            return found ? found.value : undefined;
        };

        const validRole = findValue(roleList, record.role);
        const validTeam = findValue(teamList, record.team);
        const validWorkPlace = findValue(workPlaceList, record.work_place);

        form.setFieldsValue({
            role_id: validRole,
            team_code: validTeam,
            work_place: validWorkPlace,
            is_active: record.is_active,
        });
        setIsModalOpen(true);
    };

    const handleOk = () => {
        form.validateFields().then(async (values) => {
            setLoading(true);
            try {
                const currentUserToken = TokenService.getUser();
                const username = currentUserToken?.username || "System";
                let payload = {};

                if (modalMode === 'add') {
                    if (!searchedUser || !searchedUser.oa_user) {
                        noticeShowMessage("Please search and select a user first", true);
                        return;
                    }
                    payload = {
                        oa_user: searchedUser.oa_user,
                        first_name_th: searchedUser.first_name_th,
                        last_name_th: searchedUser.last_name_th,
                        first_name_en: searchedUser.first_name_en,
                        last_name_en: searchedUser.last_name_en,
                        email: searchedUser.email,
                        division_code: searchedUser.division,
                        role_id: values.role_id,
                        team_code: values.team_code,
                        work_place: values.work_place,
                        is_active: values.is_active,
                        username: username,
                        mode: 'add'
                    };
                } else {
                    payload = {
                        oa_user: currentUser.oa_user,
                        first_name_th: currentUser.first_name_th,
                        last_name_th: currentUser.last_name_th,
                        first_name_en: currentUser.first_name_en,
                        last_name_en: currentUser.last_name_en,
                        email: currentUser.email,
                        division_code: currentUser.division,
                        role_id: values.role_id,
                        team_code: values.team_code,
                        work_place: values.work_place,
                        is_active: values.is_active,
                        username: username,
                        mode: 'edit'
                    };
                }

                const response = await postUserManage.post_user_manage(payload);

                if (response.status === 200 || response.data?.res_code === 200) {
                    noticeShowMessage(modalMode === 'add' ? "User added successfully" : "User updated successfully", false);
                    setIsModalOpen(false);
                    fetchUsers(keyword);
                } else {
                    noticeShowMessage(response.data?.message || "Failed to save user", true);
                }
            } catch (error) {
                if (error.response) {
                    const status = error.response.status;
                    if (status === 401) {
                        TokenService.deleteUser();
                        return navigate("/signin", { state: { message: "session expire" } });
                    }
                    if (status === 403) return noticeShowMessage("access-denied", true);
                    if (status === 404) return noticeShowMessage("not-found", true);

                    // Show specific error message from backend if available
                    if (error.response.data && error.response.data.message) {
                        return noticeShowMessage(error.response.data.message, true);
                    }

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
        }).catch((info) => {
            console.log('Validate Failed:', info);
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    // Columns
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
            align: 'center',
            render: (record) => (
                <Button
                    style={{ backgroundColor: '#ffc107', borderColor: '#ffc107', color: 'black', fontWeight: '500' }}
                    icon={<EditOutlined />}
                    onClick={() => showEditModal(record)}
                >
                    Edit
                </Button>
            ),
        },
        {
            title: 'OA User',
            dataIndex: 'oa_user',
            key: 'oa_user',
            SortName: 'oa_user',
            align: 'center',
        },
        {
            title: 'ชื่อ-นามสกุล',
            key: 'fullname',
            render: (text, record) => `${record.first_name_th || ''} ${record.last_name_th || ''}`,
            SortName: 'first_name_th',
        },
        {

            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            SortName: 'role',
            align: 'center',
        },
        {
            title: 'Team',
            dataIndex: 'team',
            key: 'team',
            SortName: 'team',
            align: 'center',
        },
        {
            title: 'ส่วนงาน (Division)',
            dataIndex: 'division',
            key: 'division',
            SortName: 'division'
        },
        {
            title: 'สถานที่ปฏิบัติงาน',
            dataIndex: 'work_place',
            key: 'work_place',
            SortName: 'work_place',
        },
        {
            title: 'สถานะ',
            dataIndex: 'is_active',
            key: 'is_active',
            align: 'center',
            render: (status) => (
                <Tag color={status ? "#198754" : "#dc3545"} style={{ fontSize: '14px', padding: '5px 15px', borderRadius: '15px' }}>
                    {status ? "ใช้งาน" : "ไม่ใช้งาน"}
                </Tag>
            ),
        }
    ];

    const tableProps = {
        columns: columns,
        dataSource: userData,
        pagination: true,
        defaultPageSize: 20,
        bordered: true,
        size: "large",
        loading: loading
    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#e9ecef', minHeight: '80vh' }}>
            {/* Search Section */}
            {/* Search Section */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px', overflow: 'hidden' }}>
                <div style={{
                    backgroundColor: '#aebbff', // blue header
                    padding: '10px 20px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: 'black'
                }}>
                    Search
                </div>
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '300px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '16px', marginRight: '10px' }}>Keyword:</span>
                        <Input
                            placeholder="กรอก OA User, ชื่อ-นามสกุล, Role, Team, ส่วนงาน, สถานที่ปฏิบัติงาน"
                            style={{ width: '100%', maxWidth: '500px' }}
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onPressEnter={handleSearch}
                        />
                    </div>
                    <Space style={{ marginTop: '10px' }}>
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={handleSearch}
                            style={{ backgroundColor: '#0dcaf0', borderColor: '#0dcaf0', color: '#000', fontWeight: 'bold' }}
                        >
                            Search
                        </Button>
                        <Button
                            icon={<ClearOutlined />}
                            onClick={handleClear}
                            style={{ backgroundColor: '#e2e6ea', borderColor: '#dae0e5', color: '#000', fontWeight: 'bold' }}
                        >
                            Clear
                        </Button>
                    </Space>
                </div>
            </div>

            {/* Table Section */}
            <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '5px' }}>
                <TableUI {...tableProps} />
            </div>

            {/* Modal Section */}
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
                        <span>{modalMode === 'add' ? 'Add - User' : 'Edit - User'}</span>
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
                {/* Add Mode - Search Section */}
                {modalMode === 'add' && (
                    <div style={{ padding: '15px', border: '1px solid #d9d9d9', borderRadius: '4px', marginBottom: '20px' }}>
                        <Row gutter={[16, 16]} align="middle">
                            <Col span={12}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 'bold', width: '80px' }}>ชื่อ (EN):</span>
                                    <Input
                                        placeholder="กรอก ชื่ออังกฤษ"
                                        style={{ flex: 1 }}
                                        value={searchFnEn}
                                        onChange={(e) => setSearchFnEn(e.target.value)}
                                    />
                                </div>
                            </Col>
                            <Col span={12}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 'bold', width: '100px' }}>นามสกุล(EN):</span>
                                    <Input
                                        placeholder="กรอก นามสกุลอังกฤษ"
                                        style={{ flex: 1 }}
                                        value={searchLnEn}
                                        onChange={(e) => setSearchLnEn(e.target.value)}
                                    />
                                </div>
                            </Col>
                            <Col span={12}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 'bold', width: '80px' }}>OA-User:</span>
                                    <Input
                                        placeholder="กรอก OA-User"
                                        style={{ flex: 1 }}
                                        value={searchOa}
                                        onChange={(e) => setSearchOa(e.target.value)}
                                    />
                                </div>
                            </Col>
                            <Col span={12}>
                                <Button
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    onClick={handleUserSearch}
                                    style={{ backgroundColor: '#0dcaf0', borderColor: '#0dcaf0', color: '#000', fontWeight: 'bold' }}
                                >
                                    Search
                                </Button>
                            </Col>
                        </Row>
                    </div>
                )}

                <Form
                    form={form}
                    layout="horizontal"
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 15 }}
                    labelAlign="left"
                    style={{ marginTop: '10px' }}
                >
                    {/* Display Details (Read-only) */}
                    {(modalMode === 'edit' && currentUser) && (
                        <>
                            <Row gutter={24} style={{ marginBottom: '10px', marginLeft: '-5px' }}>
                                <Col span={12}>
                                    <span style={{ fontWeight: 'bold', marginRight: '5px' }}>OA-User:</span>
                                    <span>{currentUser.oa_user}</span>
                                </Col>
                                <Col span={12}>
                                    <span style={{ fontWeight: 'bold', marginRight: '5px' }}>ส่วนงาน:</span>
                                    <span>{currentUser.Division}</span>
                                </Col>
                            </Row>
                            <Row gutter={24} style={{ marginBottom: '10px', marginLeft: '-5px' }}>
                                <Col span={12}>
                                    <span style={{ fontWeight: 'bold', marginRight: '5px' }}>ชื่อ (TH):</span>
                                    <span>{currentUser.first_name_th}</span>
                                </Col>
                                <Col span={12}>
                                    <span style={{ fontWeight: 'bold', marginRight: '5px' }}>นามสกุล (TH):</span>
                                    <span>{currentUser.last_name_th}</span>
                                </Col>
                            </Row>
                            <Row gutter={24} style={{ marginBottom: '10px', marginLeft: '-5px' }}>
                                <Col span={12}>
                                    <span style={{ fontWeight: 'bold', marginRight: '5px' }}>ชื่อ (EN):</span>
                                    <span>{currentUser.first_name_en}</span>
                                </Col>
                                <Col span={12}>
                                    <span style={{ fontWeight: 'bold', marginRight: '5px' }}>นามสกุล(EN):</span>
                                    <span>{currentUser.last_name_en}</span>
                                </Col>
                            </Row>
                            <Row gutter={24} style={{ marginBottom: '20px', marginLeft: '-5px' }}>
                                <Col span={24}>
                                    <span style={{ fontWeight: 'bold', marginRight: '5px' }}>E-mail:</span>
                                    <span>{currentUser.email}</span>
                                </Col>
                            </Row>
                        </>
                    )}

                    {(modalMode === 'add') && (
                        <>
                            <Row gutter={24} style={{ marginBottom: '10px', marginLeft: '-5px' }}>
                                <Col span={12}>
                                    <span style={{ fontWeight: 'bold', marginRight: '5px' }}>OA-User:</span>
                                    <span>{searchedUser.oa_user}</span>
                                </Col>
                                <Col span={12}>
                                    <span style={{ fontWeight: 'bold', marginRight: '5px' }}>ส่วนงาน:</span>
                                    <span>{searchedUser.division}</span>
                                </Col>
                            </Row>
                            <Row gutter={24} style={{ marginBottom: '10px', marginLeft: '-5px' }}>
                                <Col span={12}>
                                    <span style={{ fontWeight: 'bold', marginRight: '5px' }}>ชื่อ (TH):</span>
                                    <span>{searchedUser.first_name_th}</span>
                                </Col>
                                <Col span={12}>
                                    <span style={{ fontWeight: 'bold', marginRight: '5px' }}>นามสกุล (TH):</span>
                                    <span>{searchedUser.last_name_th}</span>
                                </Col>
                            </Row>
                            <Row gutter={24} style={{ marginBottom: '10px', marginLeft: '-5px' }}>
                                <Col span={12}>
                                    <span style={{ fontWeight: 'bold', marginRight: '5px' }}>ชื่อ (EN):</span>
                                    <span>{searchedUser.first_name_en}</span>
                                </Col>
                                <Col span={12}>
                                    <span style={{ fontWeight: 'bold', marginRight: '5px' }}>นามสกุล(EN):</span>
                                    <span>{searchedUser.last_name_en}</span>
                                </Col>
                            </Row>
                            <Row gutter={24} style={{ marginBottom: '20px', marginLeft: '-5px' }}>
                                <Col span={24}>
                                    <span style={{ fontWeight: 'bold', marginRight: '5px' }}>E-mail:</span>
                                    <span>{searchedUser.email}</span>
                                </Col>
                            </Row>
                        </>
                    )}

                    {/* Editable Fields */}
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item name="team_code" label={<span style={{ fontWeight: 'bold' }}>Team</span>} rules={[{ required: true, message: 'กรุณาเลือก Team' }]}>
                                <Select placeholder="-เลือก-">
                                    {teamList.map(team => (
                                        <Option key={team.value} value={team.value}>{team.label}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <div style={{ display: 'flex', alignItems: 'center', height: '32px', marginLeft: '5px' }}>
                                <span style={{ marginRight: '8px', fontWeight: 'bold' }}>สถานะ :</span>
                                <Form.Item name="is_active" valuePropName="checked" noStyle>
                                    <Checkbox>ใช้งาน</Checkbox>
                                </Form.Item>
                            </div>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item name="role_id" label={<span style={{ fontWeight: 'bold' }}>Role</span>} rules={[{ required: true, message: 'กรุณาเลือก Role' }]}>
                                <Select placeholder="-เลือก-">
                                    {roleList.map(role => (
                                        <Option key={role.value} value={role.value}>{role.label}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="work_place"
                                label={<span style={{ fontWeight: 'bold' }}>สถานที่ปฏิบัติงาน</span>}
                                rules={[{ required: true, message: 'กรุณาเลือกสถานที่ปฏิบัติงาน' }]}
                                labelCol={{ span: 9 }}
                                wrapperCol={{ span: 15 }}
                                style={{ marginLeft: '-5px' }}
                            >
                                <Select placeholder="-เลือก-">
                                    {workPlaceList.map(item => (
                                        <Option key={item.value} value={item.value}>{item.label}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

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

export default UserManage;
