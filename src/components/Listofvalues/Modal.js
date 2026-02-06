import React, { useState, useEffect } from "react";
import { postLov } from "../../services/Lov.service";
import { Alert } from "antd";

const Modal = ({ show, onClose, onSave, title, data, existingData = [] }) => {
    const [formData, setFormData] = useState({
        fieldName: "",
        code: "",
        description: "",
        condition: "",
        orderIndex: "",
        isActive: true
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (show) {
            setLoading(false); // Reset loading when modal opens
            setError(""); // Reset error
            if (data) {
                // Edit Mode - Pre-fill data
                setFormData({
                    fieldName: data.fieldName || "",
                    code: data.code || "",
                    description: data.description || "",
                    condition: data.condition || "",
                    orderIndex: data.orderIndex || "",
                    isActive: data.isActive !== undefined ? data.isActive : true
                });
            } else {
                // Add Mode - Reset form
                setFormData({
                    fieldName: "",
                    code: "",
                    description: "",
                    condition: "",
                    orderIndex: "",
                    isActive: true
                });
            }
        }
    }, [show, data]);

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;

        // Calculate new state for validation
        const nextFormData = {
            ...formData,
            [id]: type === "checkbox" ? checked : value
        };

        setFormData(prev => ({
            ...prev,
            [id]: type === "checkbox" ? checked : value
        }));

        // Real-time Validation (Only for Add Mode)
        if (!data) {
            const isDuplicate = existingData.some(item =>
                item.fieldName === (id === "fieldName" ? value : formData.fieldName) &&
                item.code === (id === "code" ? value : formData.code)
            );

            if (isDuplicate) {
                setError(`มี Field Name: "${id === "fieldName" ? value : formData.fieldName}" และ Code: "${id === "code" ? value : formData.code}" นี้ในระบบแล้ว`);
            } else {
                setError("");
            }
        } else {
            if (error) setError(""); // Clear error if editing
        }
    };

    const handleSaveClick = async () => {
        // Double check duplication before save (Security measure)
        if (!data) { // Add Mode
            const isDuplicate = existingData.some(item =>
                item.fieldName === formData.fieldName &&
                item.code === formData.code
            );
            if (isDuplicate) {
                setError(`มี Field Name: "${formData.fieldName}" และ Code: "${formData.code}" นี้ในระบบแล้ว`);
                return;
            }
        }

        if (!formData.fieldName || !formData.code) {
            setError("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (Field Name, Code)");
            return;
        }

        setLoading(true);
        try {
            await postLov.post_lov(formData);
            onSave(formData); // Notify parent (Listofvalues) to close
        } catch (error) {
            console.error("Error saving data:", error);
            // Optionally handle error (show toast/alert)
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    const isEditMode = !!data;

    return (
        <>
            {/* Backdrop */}
            <div className="modal-backdrop fade show"></div>

            {/* Modal */}
            <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document" style={{ maxWidth: '600px' }}>
                    <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">

                        {/* Header */}
                        <div className="modal-header text-white" style={{ backgroundColor: '#2750B0', borderBottom: 'none' }}>
                            <h5 className="modal-title fw-bold">{title}</h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                aria-label="Close"
                                onClick={onClose}
                            ></button>
                        </div>

                        {/* Body */}
                        <div className="modal-body p-4">
                            <form>
                                {/* Field Name */}
                                <div className="mb-3 row align-items-center">
                                    <label className="col-sm-3 col-form-label text-end fw-bold">
                                        {!isEditMode && <span className="text-danger me-1">*</span>}Field Name:
                                    </label>
                                    <div className="col-sm-9">
                                        {isEditMode ? (
                                            <span className="form-control-plaintext text-start">{formData.fieldName}</span>
                                        ) : (
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="fieldName"
                                                placeholder="กรอก File Name"
                                                value={formData.fieldName}
                                                onChange={handleChange}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Code */}
                                <div className="mb-3 row align-items-center">
                                    <label className="col-sm-3 col-form-label text-end fw-bold">
                                        {!isEditMode && <span className="text-danger me-1">*</span>}Code:
                                    </label>
                                    <div className="col-sm-9">
                                        {isEditMode ? (
                                            <span className="form-control-plaintext text-start">{formData.code}</span>
                                        ) : (
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="code"
                                                placeholder="กรอก Code"
                                                value={formData.code}
                                                onChange={handleChange}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-3 row align-items-center">
                                    <label className="col-sm-3 col-form-label text-end fw-bold">
                                        Description:
                                    </label>
                                    <div className="col-sm-9">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="description"
                                            placeholder="กรอก Description"
                                            value={formData.description}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Condition */}
                                <div className="mb-3 row">
                                    <label className="col-sm-3 col-form-label text-end fw-bold">
                                        Condition:
                                    </label>
                                    <div className="col-sm-9">
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            id="condition"
                                            placeholder="กรอก Condition"
                                            value={formData.condition}
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>
                                </div>

                                {/* Order */}
                                <div className="mb-3 row align-items-center">
                                    <label className="col-sm-3 col-form-label text-end fw-bold">
                                        Order:
                                    </label>
                                    <div className="col-sm-4">
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="orderIndex"
                                            placeholder="กรอก Order"
                                            value={formData.orderIndex}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="mb-3 row align-items-center">
                                    <label className="col-sm-3 col-form-label text-end fw-bold">
                                        สถานะ:
                                    </label>
                                    <div className="col-sm-9">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="isActive"
                                                checked={formData.isActive}
                                                onChange={handleChange}
                                                style={{ backgroundColor: formData.isActive ? '#0d6efd' : 'white', borderColor: '#dee2e6' }}
                                            />
                                            <label className="form-check-label" htmlFor="isActive">
                                                ใช้งาน
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-3 px-3">
                                <Alert message={error} type="error" showIcon />
                            </div>
                        )}

                        {/* Footer */}
                        <div className="modal-footer justify-content-center border-top-0 pb-4">
                            {loading ? (
                                <button className="btn fw-bold px-4 rounded-3 d-flex align-items-center gap-2" style={{ backgroundColor: '#BCD0FF', color: '#000', width: '150px', justifyContent: 'center' }} type="button" disabled>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Loading...
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn fw-bold px-4 rounded-3 d-flex align-items-center gap-2"
                                    style={{ backgroundColor: '#BCD0FF', color: '#000', width: '150px', justifyContent: 'center' }}
                                    onClick={handleSaveClick}
                                >
                                    <i className="bi bi-download"></i> Save
                                </button>
                            )}
                            <button
                                type="button"
                                className="btn btn-light fw-bold px-4 rounded-3 border-dark d-flex align-items-center gap-2"
                                style={{ backgroundColor: '#D3D3D3', width: '150px', justifyContent: 'center' }}
                                onClick={onClose}
                            >
                                <i className="bi bi-x-lg"></i> Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Modal;
