import React from 'react';
import { Tag } from 'antd';
import { Button } from 'react-bootstrap';

const BaseTag = ({ color, text, style, minWidth = "80px", ...props }) => (
    <Tag
        style={{
            backgroundColor: color,
            color: "white",
            borderRadius: "20px",
            minWidth: minWidth,
            textAlign: "center",
            fontSize: "14px",
            padding: "5px 10px",
            border: "none",
            fontWeight: "normal",
            ...style
        }}
        {...props}
    >
        {text}
    </Tag>
);

export const ActiveTag = (props) => (
    <BaseTag color="#198754" text="ใช้งาน" {...props} />
);

export const InactiveTag = (props) => (
    <BaseTag color="#DC3545" text="ไม่ใช้งาน" {...props} />
);

export const ApproveTag = (props) => (
    <BaseTag color="#198754" text="Approve" style={{ minWidth: "125px" }} />
);

export const RejectTag = ({ onClick, style, className, ...props }) => {
    if (onClick) {
        return (
            <Button
                className={className}
                onClick={onClick}
                style={{

                    borderRadius: "20px",
                    minWidth: "125px",
                    textAlign: "center",
                    fontSize: "14px",
                    padding: "5px 10px",

                    fontWeight: "normal",
                    "--bs-btn-bg": "#DC3545",
                    "--bs-btn-hover-bg": "#f16e7bff",
                    "--bs-btn-active-bg": "#f16e7bff",
                    ...style
                }}
                {...props}
            >
                Reject
            </Button>
        );
    }
    return <BaseTag color="#DC3545" text="Reject" style={{ minWidth: "125px", ...style }} {...props} />;
};

export const PendingApproveTag = (props) => (
    <BaseTag color="#F0B400" text="Pending Approve" {...props} />
);
