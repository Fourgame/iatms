import React from 'react';
import { Tag } from 'antd';

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

export const RejectTag = (props) => (
    <BaseTag color="#DC3545" text="Reject" style={{ minWidth: "125px" }} />
);

export const PendingApproveTag = (props) => (
    <BaseTag color="#F0B400" text="Pending Approve" {...props} />
);
