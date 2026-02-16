import React, { useState, useEffect } from "react";
import "../Utilities/Table/Table.css";
import { Select, Checkbox, Tag, Modal, Form, Input, DatePicker } from "antd";
import { Card } from 'react-bootstrap';
import { getHolidays, postHolidays, getHolidayYears } from "../../services/้้holidays.service";
import TableUI from "../Utilities/Table/TableUI";
import Loading from "../Utilities/Loading";
import { SearchToolBtnBootstrap, ClearToolBtnBootstrap, AddToolBtnBootstrap, EditToolBtnBootstrap, SaveModalBtnBootstrap, CloseModalBtnBootstrap, CloseIconBtn } from "../Utilities/Buttons/Buttons";
import { noticeShowMessage } from '../Utilities/Notification';
import moment from "moment";
import { useNavigate } from "react-router-dom";
import TokenService from "../../services/token.service";

const { Option } = Select;

const HolidaysModal = ({ show, onClose, onSave, title, data, existingData = [] }) => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            form.resetFields();
            if (data) {
                // Edit Mode
                form.setFieldsValue({
                    holidayDate: data.holidayDate ? moment(data.holidayDate) : null,
                    holidayName: data.holidayName,
                    isActive: data.isActive,
                });
            } else {
                // Add Mode
                form.setFieldsValue({
                    holidayDate: null,
                    holidayName: "",
                    isActive: true,
                });
            }
        }
    }, [show, data, form]);

    const handleSaveClick = async () => {

        try {
            const currentUser = TokenService.getUser();
            if (!currentUser) {
                TokenService.deleteUser();
                return navigate("/signin", { state: { message: "token not found" } });
            }

            const values = await form.validateFields();
            setLoading(true);

            const payload = {
                holidayDate: values.holidayDate ? values.holidayDate.format("YYYY-MM-DD") : null,
                holidayName: values.holidayName,
                isActive: values.isActive,
            };

            try {
                await postHolidays.post_holidays(payload);
                noticeShowMessage(data ? "บันทึกข้อมูลสำเร็จ" : "บันทึกข้อมูลสำเร็จ", false);
                onSave(values.holidayDate ? values.holidayDate.year() : null);
                setLoading(false);
            } catch (err) {
                if (err.response?.status === 401) {
                    TokenService.deleteUser();
                    return navigate("/", { state: { message: "session expire from save handle" } });
                }
                setLoading(false);
                const serverMessage = err.response?.data?.message || err.message;
                noticeShowMessage(serverMessage || "เกิดข้อผิดพลาดในการบันทึกข้อมูล", true);
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
            >
                <Form.Item
                    name="holidayDate"
                    label={<span className="fw-bold">วันที่</span>}
                    rules={[
                        { required: true, message: 'เลือกวันที่' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (value && !value.isValid()) {
                                    return Promise.reject(new Error("รูปแบบวันที่ไม่ถูกต้อง"));
                                }
                                if (!data && value) {
                                    const formattedDate = value.format("YYYY-MM-DD");
                                    const isDuplicate = existingData.some(
                                        (item) => item.holidayDate && item.holidayDate === formattedDate
                                    );
                                    if (isDuplicate) {
                                        return Promise.reject(new Error(`วันที่ "${value.format("DD/MM/YYYY")}" มีในระบบแล้ว`));
                                    }
                                }
                                return Promise.resolve();
                            },
                        }),
                    ]}
                >
                    {isEditMode ? (
                        <span className="form-control-plaintext text-start" style={{ paddingLeft: '11px' }}>
                            {data.holidayDate ? moment(data.holidayDate).format("DD/MM/YYYY") : "-"}
                        </span>
                    ) : (
                        <DatePicker
                            format="DD/MM/YYYY"
                            style={{ width: '100%' }}
                            placeholder="DD/MM/YYYY"
                            inputReadOnly={true}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSaveClick();
                                }
                            }}
                        />
                    )}
                </Form.Item>

                <Form.Item
                    name="holidayName"
                    label={<span className="fw-bold">ชื่อวันหยุด</span>}
                    rules={[{ required: true, whitespace: true, message: 'กรอกชื่อวันหยุด' }]}
                >
                    <Input
                        maxLength={100}
                        placeholder="กรอกชื่อวันหยุด" onPressEnter={handleSaveClick} />
                </Form.Item>

                <Form.Item
                    name="isActive"
                    label={<span className="fw-bold">สถานะ</span>}
                    valuePropName="checked"
                >
                    <Checkbox
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

                <div className="modal-footer justify-content-center border-top-0 pb-0 pt-3">
                    <SaveModalBtnBootstrap onClick={handleSaveClick} loading={loading} />
                    <div style={{ width: '40px' }}></div>
                    <CloseModalBtnBootstrap onClick={onClose} />
                </div>
            </Form>
        </Modal>
    );
};

const Holidays = () => {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();
    const [yearSearch, setYearSearch] = useState(currentYear);
    const [isActive, setIsActive] = useState(true);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [yearOptions, setYearOptions] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [selectedRecord, setSelectedRecord] = useState(null);

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

    const initializeData = async () => {
        setLoading(true);
        try {
            const currentUser = TokenService.getUser();
            if (!currentUser) {
                TokenService.deleteUser();
                return navigate("/signin", { state: { message: "token not found" } });
            }

            // 1. Get Years from API
            const response = await getHolidayYears.get_holiday_years();
            const yearData = response.data || [];

            // 2. Process and Sort Years
            // API returns [{ "year": 2027 }, { "year": 2026 }, ...]
            let options = yearData.map(item => item.year);

            // Sort descending
            options.sort((a, b) => b - a);

            // 3. Generate Options
            if (options.length === 0) {
                // Fallback to current year if no data
                options.push(currentYear);
            }
            setYearOptions(options);

            // 4. Set Default Year (Max Year which is first in sorted list)
            const defaultYear = options.length > 0 ? options[0] : currentYear;
            setYearSearch(defaultYear);

            // 5. Fetch Data for Default Year
            await fetchData(defaultYear);

        } catch (error) {
            handleRequestError(error);
            // Fallback
            setYearOptions([currentYear]);
            setYearSearch(currentYear);
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async (searchYear = yearSearch, isactive = isActive) => {
        setLoading(true);
        try {
            const currentUser = TokenService.getUser();
            if (!currentUser) {
                TokenService.deleteUser();
                return navigate("/signin", { state: { message: "token not found" } });
            }

            const payload = {
                yearSearch: searchYear,
                isActive: isactive
            };

            const response = await getHolidays.get_holidays(payload);
            setData(response.data || []);
        } catch (error) {
            handleRequestError(error);
            setData([]);
        } finally {
            setLoading(false);
        }

    };

    const handleSearch = () => {
        fetchData();
        setOpenDropdown(false);
    };

    const handleClear = () => {

        // Requirement logic for Clear: 
        // Reset to default? The default is dynamic (Max Year).
        // Since we stored options, we can reset to options[0] (Max).
        const defaultYear = yearOptions.length > 0 ? yearOptions[0] : currentYear;
        const defaultIsActive = true;
        setYearSearch(defaultYear);
        setIsActive(defaultIsActive);
        setOpenDropdown(false);



        // Fetch with defaults
        fetchData(defaultYear, defaultIsActive); // Pass explicitly to ensure correct value used
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

    // Modal Handlers
    const handleAdd = () => {
        setModalTitle("Add - Manage Holiday");
        setSelectedRecord(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setModalTitle("Edit - Manage Holiday");
        setSelectedRecord(record);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSaveModal = async (savedYear) => {
        setIsModalOpen(false);

        // 1. Refresh Year List
        setLoading(true);
        try {
            const response = await getHolidayYears.get_holiday_years();
            const yearData = response.data || [];

            // 2. Process and Sort Years
            let options = yearData.map(item => item.year);
            // Sort descending
            options.sort((a, b) => b - a);

            if (options.length === 0) {
                options.push(currentYear);
            }
            setYearOptions(options);

            // 2. Determine target year
            // If we have a savedYear, switch to it.
            // If not (e.g. cleared date?), fallback to maxYear (options[0]) or current.
            const maxYear = options.length > 0 ? options[0] : currentYear;
            const targetYear = savedYear || maxYear;

            // 3. Set State and Fetch Data
            setYearSearch(targetYear);
            await fetchData(targetYear);

        } catch (error) {
            // Fallback: just fetch data for current yearSearch or something
            fetchData();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!TokenService.isSignIn()) {
            return navigate("/", { state: { message: "please login" } });

        } else {
            initializeData();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = [
        {
            title: "วันที่",
            dataIndex: "holidayDate",
            key: "holidayDate",
            align: "center",
            width: "25%",
            sorter: (a, b) => new Date(a.holidayDate || 0) - new Date(b.holidayDate || 0),
            render: (text) => text ? new Date(text).toLocaleDateString("en-GB") : "-", // Formatting date dd/mm/yyyy
        },
        {
            title: "ชื่อวันหยุด",
            dataIndex: "holidayName", // Guessing field name
            key: "holidayName",
            align: "center",
            width: "25%",
            sorter: (a, b) => String(a.holidayName ?? "").localeCompare(String(b.holidayName ?? "")),
            render: (text) => (
                <div style={{ textAlign: text && text.trim() ? "left" : "center" }}>
                    {text && text.trim()}
                </div>
            ),
        },
        {
            title: "สถานะ",
            dataIndex: "isActive",
            key: "isActive",
            align: "center",
            width: "25%",
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
        }
    ];

    const actionColumn = {
        title: (
            <AddToolBtnBootstrap onClick={handleAdd} />
        ),
        key: "actions",
        dataIndex: "actions",
        align: "center",
        width: "25%",
        render: (_, record) => (
            <EditToolBtnBootstrap onClick={() => handleEdit(record)} />
        ),
    };
    // if (!TokenService.isSignIn()) {
    //     noticeShowMessage("session expire", true);
    //     return navigate("/", { state: { message: "session expire 1" } });
    // }

    const columnsWithActions = [actionColumn, ...columns];

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
                            gap: "15px",
                            background: "white",
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: 700, fontSize: '16px' }}>ปี:</span>
                            <Select
                                value={yearSearch}
                                open={openDropdown}
                                onDropdownVisibleChange={(open) => setOpenDropdown(open)}
                                onKeyDown={handleKeyDown}
                                onChange={(value) => setYearSearch(value)}

                                style={{ width: 150 }}
                            >
                                {yearOptions.map(year => (
                                    <Option key={year} value={year}>{year}</Option>
                                ))}
                            </Select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: 700, fontSize: '16px' }}>สถานะ:</span>
                            <Checkbox
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                onKeyDown={handleKeyDown}
                                style={{ fontSize: '14px' }}
                            >
                                ใช้งาน
                            </Checkbox>
                        </div>

                        <div style={{ marginLeft: "auto", display: 'flex', gap: '10px' }}>
                            <SearchToolBtnBootstrap onClick={handleSearch} />
                            <ClearToolBtnBootstrap onClick={handleClear} />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="m-3">
                        <TableUI
                            dataSource={data}
                            columns={columnsWithActions}
                            // If no ID, I might need to generate one or use index.
                            // Replacing rowKey with function just in case
                            rowKey={(r, index) => r.id || index}
                            pagination={true}
                            bordered={true}
                            size={"large"}
                        />
                    </div>
                </Card.Body>
            </Card>

            {/* Modal */}
            <HolidaysModal
                show={isModalOpen}
                title={modalTitle}
                data={selectedRecord}
                existingData={data}
                onClose={handleCloseModal}
                onSave={handleSaveModal}
            />
        </div>
    );
};

export default Holidays;
