import { Button, Empty, Popconfirm, Table } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import "./Table.css";
import { IsEmpty } from "../../SysComponent/SystemComponent";

// const IsEmpty = (value) => {
//   return (
//     value === null ||
//     value === undefined ||
//     value === "" ||
//     (Array.isArray(value) && value.length === 0) ||
//     (typeof value === "object" && Object.keys(value).length === 0)
//   );
// };

// import "../Table/Table.css";

/**
 * Table UI
 * @param props TableUI Prop
 * @returns
 */
export const TableUI = (props) => {
  const [selectedRows, setSelectedRows] = useState([]); //ข้อมูลชนิด [{}] เช่น [{a : '1'},{a : '2'}]
  const [columns, setColumns] = useState([]);
  const [selectedForRowsKey, setSelectedForRowKey] = useState([]); //ข้อมูลชนิด string[] | number[] เช่น ['a','b']

  const onChange = (pagination, filters, sorter, extra) => { };
  const SortTableUI = (a, b) => {
    var formats = [moment.ISO_8601, "MM/DD/YYYY  :)  HH*mm*ss"];
    if (typeof a === "number" && typeof b === "number") {
      return Number(a) - Number(b);
    } else if (
      moment(a, formats, true).isValid() &&
      moment(b, formats, true).isValid()
    ) {
      return moment(a).unix() - moment(b).unix();
    } else if (typeof a === "string" && typeof b === "string") {
      return String(a).localeCompare(String(b));
    } else {
      return a - b;
    }
  };

  useEffect(() => {
    (props.columns || []).forEach((f) => {
      if (!IsEmpty(f.SortName)) {
        f["sorter"] = (a, b) => SortTableUI(a[f.SortName], b[f.SortName]);
      }
      if (f.IsSerialNumber) {
        f["render"] = (value, item, index) => index + 1;
      }
    });
    setColumns([...props.columns]);
  }, [props.columns]);

  useEffect(() => {
    setSelectedRows([]);
    setSelectedForRowKey([]);
  }, [props.dataSource]);

  return (
    <Table
      className={props.classname ? props.classname : "table-striped-rows divTab"}
      rowKey={props.rowKey}
      indentSize={3}
      onChange={onChange}
      loading={props.loading || false}
      components={props.components || undefined}
      columns={columns || []}
      dataSource={props.dataSource || []}
      scroll={props.scroll || undefined}
      sticky={props.sticky || false}
      bordered={props.bordered || true}
      size={props.size || "small"}
      locale={{
        cancelSort: "Click to cancel sorting",
        triggerAsc: "Click to sort ascending",
        triggerDesc: "Click to sort descending",
        emptyText: (<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="- No data -" />),
      }}
      showHeader={props.showHeader}
      pagination={
        props.pagination === true
          ? {
            size: "small",
            defaultPageSize: props.defaultPageSize ? props.defaultPageSize : 20,
            pageSizeOptions: ["10", "20", "30", "50", "100"],
            responsive: true,
            total: (props.dataSource || []).length,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            showTitle: true,
            showSizeChanger: true,
            style: { justifyContent: "center" },
            onChange(page, pageSize) {
              (columns || []).forEach((f) => {
                if (f.IsSerialNumber) {
                  f["render"] = (value, item, index) =>
                    (page - 1) * (pageSize || 10) + index + 1;
                }
              });
              setColumns([...columns]);
            },
          }
          : false
      }
      expandable={props.expandable}
      rowClassName={(record, index) => {
        return props.rowClassName || "";
      }}
      rowSelection={
        props.rowSelection
          ? {
            type: "checkbox",
            ...props.rowSelection,
            selectedRowKeys: selectedForRowsKey,
            onChange: (selectedRowKeys, selectedRows) => {
              setSelectedRows([...selectedRows]);
              setSelectedForRowKey(selectedRowKeys);
              props.rowSelection.onChange &&
                props.rowSelection.onChange(selectedRowKeys, selectedRows);
            },
            onSelectMultiple: () => { },
          }
          : undefined
      }
      footer={
        props.onDelete
          ? () =>
            selectedRows.length > 0 && (
              <Popconfirm
                title={
                  "Do you want to delete " + selectedRows.length + " record ?"
                }
                okText="Yes"
                cancelText="Cancel"
                onConfirm={() => {
                  props.onDelete(selectedRows);
                  setSelectedForRowKey([]);
                  setSelectedRows([]);
                }}
              >
                <Button type="primary" size="xs" danger style={{ borderRadius: 18 }} icon={<FiTrash2 style={{ marginRight: "5px" }} />}>
                  {props.btnDeleteLabel || " Delete"}
                </Button>
              </Popconfirm>
            )
          : props.onApprove
            ? () =>
              selectedRows.length > 0 && (
                <Popconfirm
                  title={"Do you want to approve " + selectedRows.length + " records?"}
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() => {
                    props.onApprove(selectedRows);
                    setSelectedForRowKey([]);
                    setSelectedRows([]);
                  }}
                >
                  {/* <BtnOk style={{ borderRadius: 18 }}>Approve</BtnOk> */}
                </Popconfirm>
              )
            : undefined
      }
      onRow={props.onRow}
      summary={props.summary}
    />
  );
};
export default TableUI;