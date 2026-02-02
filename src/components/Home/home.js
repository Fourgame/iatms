import React from 'react';

const home = () => {
    // const profile = currentUser?.profile || {
    //     name_en: "null",
    //     name_th: "null",
    //     oaUser: "null",
    //     email: "null",
    //     division_code: "null",
    //     team: "null",
    //     work_place: "null",
    //     role_name: "null"
    // };
    const profile = {
        name_en: "null",
        name_th: "null",
        oaUser: "null",
        email: "null",
        division_code: "null",
        team: "null",
        work_place: "null",
        role_name: "null"
    };
    return <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '90vh' }}>
        <div className="row g-4">
            {/* 1. ส่วน Profile (ฝั่งซ้าย) */}
            <div className="col-12 col-lg-5">
                <div className="card h-100 border-0 shadow-sm p-4" style={{ borderRadius: '15px' }}>
                    <h2 className="fw-bold mb-4">{profile.name_en}</h2>
                    <div className="d-flex flex-column gap-3 text-secondary">
                        <div><strong>OA User ID :</strong> {profile.oaUser}</div>
                        <div><strong>Email :</strong> {profile.email}</div>
                        <div><strong>Role :</strong> {profile.role_name}</div>
                        <div><strong>Division :</strong> {profile.division_code}</div>
                        <div><strong>Team :</strong> {profile.team}</div>
                        <div><strong>Workplace :</strong> {profile.work_place}</div>
                    </div>
                </div>
            </div>
            {/* 2. ส่วนข้อมูลสรุป (ฝั่งขวา) */}
            <div className="col-12 col-lg-7">
                <div className="card h-100 border-0 shadow-sm p-4" style={{ borderRadius: '15px' }}>
                    <div className="text-center mb-4 text-dark fw-bold">
                        ข้อมูล ณ วันที่ 07/01/2026
                    </div>

                    <div className="row g-3">
                        {/* แถวที่ 1: สถานะ และ เวลา */}
                        <div className="col-4">
                            <div className="border p-3 text-center rounded h-100 shadow-sm bg-white">
                                <div className="small text-muted mb-2">สถานะ</div>
                                <div className="fw-bold h5">Check-In</div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="border p-3 text-center rounded h-100 shadow-sm bg-white">
                                <div className="small text-muted mb-2">เวลาที่เช็คอิน</div>
                                <div className="fw-bold h5">08.00 น.</div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="border p-3 text-center rounded h-100 shadow-sm bg-white">
                                <div className="small text-muted mb-2">เวลาเช็คเอาท์</div>
                                <div className="fw-bold h5 text-muted">-</div>
                            </div>
                        </div>

                        {/* แถวที่ 2: ชั่วโมงสะสม และ สถานที่ */}
                        <div className="col-4">
                            <div className="border p-3 text-center rounded h-100 shadow-sm bg-white">
                                <div className="small text-muted mb-2">จำนวนชั่วโมงสะสม</div>
                                <div className="fw-bold h5">7 ชั่วโมง 30 นาที</div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="border p-3 text-center rounded h-100 shadow-sm bg-white">
                                <div className="small text-muted mb-2">สถานที่เช็คอิน</div>
                                <div className="fw-bold">ธนาคารกรุงเทพ สำนักงานพระราม 3</div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="border p-3 text-center rounded h-100 shadow-sm bg-white">
                                <div className="small text-muted mb-2">สถานที่เช็คเอาท์</div>
                                <div className="fw-bold">ธนาคารกรุงเทพ สำนักงานพระราม 3</div>
                            </div>
                        </div>

                        {/* แถวที่ 3: สถานะคำร้อง (สีเขียว, เหลือง, แดง) */}
                        <div className="col-4">
                            <div className="p-3 text-center rounded h-100 shadow-sm" style={{ backgroundColor: '#d1f7e3', border: '1px solid #b2eecb' }}>
                                <div className="small mb-2">คำร้องอนุมัติ</div>
                                <div className="display-6 fw-bold">1</div>
                                <div className="small">รายการ</div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="p-3 text-center rounded h-100 shadow-sm" style={{ backgroundColor: '#fff4d1', border: '1px solid #ffe8a1' }}>
                                <div className="small mb-2">คำร้องรออนุมัติ</div>
                                <div className="display-6 fw-bold">1</div>
                                <div className="small">รายการ</div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="p-3 text-center rounded h-100 shadow-sm" style={{ backgroundColor: '#f7d1d1', border: '1px solid #eeb2b2' }}>
                                <div className="small mb-2">คำร้องไม่อนุมัติ</div>
                                <div className="display-6 fw-bold">0</div>
                                <div className="small">รายการ</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div >;
};

export default home;
