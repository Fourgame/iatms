import React from "react";
import { Table } from "antd";

const TableTennis = ({
  columns,
  dataSource,
  className,
  style,
  wrapperClassName,
  wrapperStyle,
  ...props
}) => {
  // ทำ pagination ให้ยืดหยุ่น: รับได้ทั้ง true/false/object
  const pagination =
    props.pagination === false
      ? false
      : {
        size: "small",
        defaultPageSize: 20,
        pageSizeOptions: ["10", "20", "30", "50", "100"],
        responsive: true,
        total: (dataSource || []).length,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        showTitle: true,
        showSizeChanger: true,
        style: { justifyContent: "center" },
        ...(typeof props.pagination === "object" ? props.pagination : {}),
      };

  return (
    <div
      className={wrapperClassName}                 // ✅ ใช้ bootstrap class ได้
      style={{
        width: "100%",
        margin: 0,
        padding: 0,                              // ✅ ไม่ดันตารางเข้าไป
        background: "transparent",               // ✅ ให้ panel ด้านนอกคุมเอง
        ...wrapperStyle,                         // ✅ override ได้ถ้าต้องการ
      }}
    >
      <Table
        {...props}
        columns={columns}
        dataSource={dataSource}
        bordered={props.bordered ?? true}
        size={props.size ?? "small"}
        pagination={pagination}
        className={className}
        style={{
          width: "100%",
          backgroundColor: "white",
          margin: 0,
          ...style,                               // ✅ override ได้ถ้าต้องการ
        }}
      />
    </div>
  );
};

export default TableTennis;
