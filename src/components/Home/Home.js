import React from "react";

const StatCard = ({ title, value, footer, bg }) => (
    <div
        className="border border-1 border-secondary p-2 d-flex flex-column h-100"
        style={{ backgroundColor: bg || "#ffffff" }}
    >
        <div className="small text-muted">{title}</div>

        {/* ให้ value อยู่กลางการ์ด */}
        <div
            className="flex-grow-1 d-flex justify-content-center align-items-center fw-bold text-center"
            style={{ fontSize: "18px", whiteSpace: "pre-line" }}
        >
            {value}
        </div>

        {footer && <div className="small text-center">{footer}</div>}
    </div>
);

const Home = () => {
    return (
        <div className="d-flex gap-3 p-3 my-3" style={{ height: "70vh" }}>
            {/* LEFT BOX */}
            <div
                className="border border-2 border-secondary h-100 p-3"
                style={{ backgroundColor: "#F5F5F5", flex: 1 }}
            >
                <div className="fw-bold fs-4 mb-3 text-start">Napat Wisetsiri</div>

                <div className="text-start" style={{ fontSize: "14px", lineHeight: "28px" }}>
                    <div>
                        <span className="fw-bold">OA User ID :</span> 6530300139
                    </div>
                    <div>
                        <span className="fw-bold">Email :</span> napat.wis@ku.th
                    </div>
                    <div>
                        <span className="fw-bold">Role :</span> Intern
                    </div>
                    <div>
                        <span className="fw-bold">Division :</span> 00191 - ENTERPRISE RESOURCE MANAGEMENT SYSTEM
                    </div>
                    <div>
                        <span className="fw-bold">Team :</span> A
                    </div>
                    <div>
                        <span className="fw-bold">Workplace :</span> สำนักงานพระราม 3
                    </div>
                </div>
            </div>

            {/* RIGHT */}
            <div
                className="border border-2 border-secondary h-100 p-2 d-flex flex-column"
                style={{ backgroundColor: "#F5F5F5", flex: 1 }}
            >
                <div className="text-center fw-bold mb-2">
                    ข้อมูล ณ วันที่ 07/01/2026
                </div>

                {/* ✅ กริด 3x3 กินพื้นที่ที่เหลือทั้งหมด */}
                <div
                    className="flex-grow-1"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gridTemplateRows: "repeat(3, 1fr)",
                        gap: "0.5rem", // ระยะห่างการ์ดเหมือนรูป (ปรับได้)
                    }}
                >
                    <StatCard title="สถานะ" value="Check-In" />
                    <StatCard title="เวลาที่เช็คอิน" value="08.00 น." />
                    <StatCard title="เวลาเช็คเอาท์" value="-" />

                    <StatCard title="จำนวนชั่วโมงสะสม" value="7 ชั่วโมง 30 นาที" />
                    <StatCard title="สถานที่เช็คอิน" value={"ธนาคารกรุงเทพ\nสำนักงานพระราม 3"} />
                    <StatCard title="สถานที่เช็คเอาท์" value="-" />

                    <StatCard title="คำร้องอนุมัติ" value="1" footer="รายการ" bg="#c9ffd9" />
                    <StatCard title="คำร้องรออนุมัติ" value="1" footer="รายการ" bg="#fff0c9" />
                    <StatCard title="คำร้องไม่อนุมัติ" value="0" footer="รายการ" bg="#ffd0d0" />
                </div>
            </div>
        </div>
    );
};

export default Home;
