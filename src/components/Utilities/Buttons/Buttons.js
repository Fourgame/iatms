import React from 'react';
import { Button } from 'antd';
import { Button as ButtonBootstrap } from 'react-bootstrap';
import { SearchOutlined, ClearOutlined, SaveOutlined, PlusOutlined, EditOutlined, PrinterOutlined, CloseOutlined, SyncOutlined, LoginOutlined, LogoutOutlined } from '@ant-design/icons';



export const SearchToolBtnBootstrap = ({ onClick, style, className, ...props }) => {
    return (
        <ButtonBootstrap
            variant="primary"
            onClick={onClick}
            className={`d-inline-flex align-items-center gap-2 ${className}`}
            style={{
                "--bs-btn-bg": "#0DCAF0",
                "--bs-btn-hover-bg": "#63d7eeff",
                "--bs-btn-active-bg": "#63d7eeff",
                border: "1px solid #000",
                ...style
            }}
            {...props}
        >
            <i class="bi bi-search" style={{ color: "#000" }}></i>
            <span style={{ color: "#000", fontWeight: "bold" }}>
                Search
            </span>
        </ButtonBootstrap>
    );
};



export const ClearToolBtnBootstrap = ({ onClick, style, className, ...props }) => {
    return (
        <ButtonBootstrap
            variant="primary"
            onClick={onClick}
            className={`d-inline-flex align-items-center gap-2 ${className}`}
            style={{
                "--bs-btn-bg": "#D3D3D3",
                "--bs-btn-hover-bg": "#E8E8E8",
                "--bs-btn-active-bg": "#E8E8E8",
                color: "#000",
                fontWeight: "bold",
                border: "1px solid #000",
                ...style
            }}
            {...props}
        >
            <ClearOutlined style={{ strokeWidth: "20", fontSize: "16px" }} />
            {/* <i className="bi bi-x-lg" style={{ color: "#000" }}></i> */}
            <span style={{ color: "#000", fontWeight: "bold" }}>
                Clear
            </span>
        </ButtonBootstrap>
    );
};



export const SaveModalBtnBootstrap = ({ onClick, style, className, loading, ...props }) => {
    return (
        <ButtonBootstrap
            variant="primary"
            onClick={onClick}
            disabled={loading}
            className={`d-inline-flex align-items-center justify-content-center gap-2 ${className}`}
            style={{
                "--bs-btn-bg": "#BCD0FF",
                "--bs-btn-border-color": "#BCD0FF",
                "--bs-btn-hover-bg": "#a3bbf0",
                "--bs-btn-hover-border-color": "#a3bbf0",
                "--bs-btn-active-bg": "#a3bbf0",
                "--bs-btn-active-border-color": "#a3bbf0",
                color: "#000",
                width: "150px",
                height: "40px",
                fontSize: "16px",
                fontWeight: "bold",
                border: "1px solid #000",
                ...style
            }}
            {...props}
        >
            <SaveOutlined />
            <span>Save</span>
        </ButtonBootstrap>
    );
};







export const PrintToolBtn = ({ onClick, style, className, ...props }) => {
    return (
        <Button
            icon={<PrinterOutlined />}
            onClick={onClick}
            style={style}
            className={className}
            {...props}
        />
    );
};



export const AddToolBtnBootstrap = ({ onClick, style, className, ...props }) => {
    return (
        <ButtonBootstrap
            variant="success"
            onClick={onClick}
            className={`d-inline-flex align-items-center gap-2 ${className}`}
            style={{
                "--bs-btn-bg": "#11A761",
                "--bs-btn-border-color": "#11A761",
                "--bs-btn-hover-bg": "#15c474",
                "--bs-btn-hover-border-color": "#15c474",
                "--bs-btn-active-bg": "#15c474",
                "--bs-btn-active-border-color": "#15c474",
                color: "#fff",
                fontWeight: "bold",
                border: "1px solid #000",
                ...style
            }}
            {...props}
        >
            <PlusOutlined style={{ fontSize: "16px" }} />
            <span style={{ fontWeight: "bold" }}>
                Add
            </span>
        </ButtonBootstrap>
    );
};

export const EditToolBtnBootstrap = ({ onClick, style, className, ...props }) => {
    return (
        <ButtonBootstrap
            variant="warning"
            size="sm"
            onClick={onClick}
            className={`d-inline-flex align-items-center gap-2 ${className}`}
            style={{
                "--bs-btn-bg": "#faad14",
                "--bs-btn-border-color": "#faad14",
                "--bs-btn-hover-bg": "#ffc53d",
                "--bs-btn-hover-border-color": "#ffc53d",
                "--bs-btn-active-bg": "#ffc53d",
                "--bs-btn-active-border-color": "#ffc53d",
                color: "#000",
                border: "1px solid #000", // Explicit black border
                ...style
            }}
            {...props}
        >
            <EditOutlined />
            <span style={{ color: "#000" }}>
                Edit
            </span>
        </ButtonBootstrap>
    );
};

export const CloseModalBtnBootstrap = ({ onClick, style, className, ...props }) => {
    return (
        <ButtonBootstrap
            variant="secondary"
            onClick={onClick}
            className={`d-inline-flex align-items-center justify-content-center gap-2 ${className}`}
            style={{
                "--bs-btn-bg": "#D3D3D3",
                "--bs-btn-border-color": "#D3D3D3",
                "--bs-btn-hover-bg": "#E8E8E8",
                "--bs-btn-hover-border-color": "#E8E8E8",
                "--bs-btn-active-bg": "#E8E8E8",
                "--bs-btn-active-border-color": "#E8E8E8",
                color: "#000",
                width: "150px",
                height: "40px",
                fontSize: "16px",
                fontWeight: "bold",
                border: "1px solid #000",
                ...style
            }}
            {...props}
        >
            <CloseOutlined />
            <span>
                Close
            </span>
        </ButtonBootstrap>
    );
};

export const CloseIconBtn = ({ style, ...props }) => {
    return (
        <CloseOutlined style={{ color: 'white', fontSize: '18px', ...style }} {...props} />
    );
};


export const ResetLocationBtn = ({ onClick, style, className, ...props }) => {
    return (
        <ButtonBootstrap
            variant="primary"
            onClick={onClick}
            className={`d-inline-flex align-items-center gap-2 ${className}`}
            style={{
                "--bs-btn-bg": "#D7F5FF",
                "--bs-btn-hover-bg": "#EAFBFF", // Lighter on hover
                "--bs-btn-active-bg": "#EAFBFF",
                "--bs-btn-border-color": "#000", // Black border
                fontWeight: "500",
                fontSize: "16px",
                padding: "5px 15px",
                color: "#000",
                border: "1px solid #000",
                ...style
            }}
            {...props}
        >
            <SyncOutlined style={{ fontSize: '14px' }} />
            <span>Reset Location</span>
        </ButtonBootstrap>
    );
};

export const CheckInBtn = ({ onClick, style, className, ...props }) => {
    return (
        <ButtonBootstrap
            variant="primary"
            size="lg"
            onClick={onClick}
            className={`d-inline-flex align-items-center justify-content-center gap-2 ${className}`}
            style={{
                "--bs-btn-bg": "#D7FFDB",
                "--bs-btn-hover-bg": "#EBFFF0", // Lighter on hover
                "--bs-btn-active-bg": "#EBFFF0",
                "--bs-btn-border-color": "#000", // Black border
                color: "#000",
                fontWeight: "500",
                fontSize: "20px",
                padding: "10px 30px",
                borderRadius: "8px",
                minWidth: "160px",
                border: "1px solid #000",
                ...style
            }}
            {...props}
        >
            <i class="bi bi-pin-map-fill"></i>
            <span>Check-In</span>
        </ButtonBootstrap>
    );
};

export const CheckOutBtn = ({ onClick, style, className, ...props }) => {
    return (
        <ButtonBootstrap
            variant="primary"
            size="lg"
            onClick={onClick}
            className={`d-inline-flex align-items-center justify-content-center gap-2 ${className}`}
            style={{
                "--bs-btn-bg": "#EFEFF0",
                "--bs-btn-hover-bg": "#F8F9FA", // Lighter on hover
                "--bs-btn-active-bg": "#F8F9FA",
                "--bs-btn-border-color": "#000", // Black border
                color: "#000",
                fontWeight: "500",
                fontSize: "20px",
                padding: "10px 30px",
                borderRadius: "8px",
                minWidth: "160px",
                border: "1px solid #000",
                ...style
            }}
            {...props}
        >
           <i class="bi bi-door-open"></i>
            <span>Check-Out</span>
        </ButtonBootstrap>
    );
};
