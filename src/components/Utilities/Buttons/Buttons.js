import React from 'react';
import { Button } from 'antd';
import { SearchOutlined, ClearOutlined, SaveOutlined, PlusOutlined, EditOutlined, PrinterOutlined, CloseOutlined } from '@ant-design/icons';

export const SearchToolBtn = ({ onClick, style, className, ...props }) => {
    return (
        <Button
            type="primary"
            icon={<SearchOutlined style={{ strokeWidth: "20", fontSize: "16px" }} />}
            style={{ background: "#00c0ef", borderColor: "#000000ff", color: "#000", borderRadius: "3px", fontWeight: "bold", borderWidth: "1px", height: "35px", ...style }}
            onClick={onClick}
            className={className}
            {...props}
        >
            Search
        </Button>
    );
};

export const ClearToolBtn = ({ onClick, style, className, ...props }) => {
    return (
        <Button
            icon={<ClearOutlined style={{ strokeWidth: "20", fontSize: "16px" }} />}
            onClick={onClick}
            // style={{ background: "#D3D3D3", borderColor: "#000000", color: "#000", borderRadius: "3px", borderWidth: "1px", fontWeight: "bold", height: "35px", ...style }}
            className={className}
            {...props}
        >
            Clear
        </Button>
    );
};

export const SaveModalBtn = ({ onClick, style, className, loading, ...props }) => {
    return (
        <Button
            type="primary"
            onClick={onClick}
            icon={<SaveOutlined />}
            loading={loading}
            style={{
                backgroundColor: "#BCD0FF",
                borderColor: "#BCD0FF",
                color: "#000",
                width: "150px",
                height: "40px",
                fontSize: "16px",
                fontWeight: "bold",
                ...style
            }}
            className={className}
            {...props}
        >
            Save
        </Button>
    );
};

export const AddToolBtn = ({ onClick, style, className, ...props }) => {
    return (
        <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={onClick}
            style={{ background: "#11A761", borderColor: "#11A761", color: "#ffffffff", ...style }}
            className={className}
            {...props}
        >
            Add
        </Button>
    );
};

export const EditToolBtn = ({ onClick, style, className, ...props }) => {
    return (
        <Button
            size="small"
            icon={<EditOutlined />}
            onClick={onClick}
            style={{ background: "#faad14", borderColor: "#faad14", color: "#000", ...style }}
            className={className}
            {...props}
        >
            Edit
        </Button>
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

export const CloseModalBtn = ({ onClick, style, className, ...props }) => {
    return (
        <Button
            onClick={onClick}
            icon={<CloseOutlined />}
            style={{
                backgroundColor: "#D3D3D3",
                borderColor: "#D3D3D3",
                color: "#000",
                width: "150px",
                height: "40px",
                fontSize: "16px",
                fontWeight: "bold",
                ...style
            }}
            className={className}
            {...props}
        >
            Close
        </Button>
    );
};

export const CloseIconBtn = ({ style, ...props }) => {
    return (
        <CloseOutlined style={{ color: 'white', fontSize: '18px', ...style }} {...props} />
    );
};
