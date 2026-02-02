import React, { useState } from 'react';
import login_background from '../Signin/Picture/login_background.png';
import { useNavigate } from 'react-router-dom';
import authService from '../../service/auth.service';
import TokenService from '../../service/token.service';

const Signin = () => {
    const [oaUser, setOaUser] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [loginError, setLoginError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // const userData = {
        // profile: {
        //     oaUser: oaUser,
        //     name_en: 'Napat Wisetsiri',
        //     name_th: 'นาพัท วิเศษสิริ',
        //     email: 'napat.wis@ku.th',
        //     division_code: '001911 - ENTERPRISE RESOURCE MANAGEMENT SYSTEM',
        //     team: 'A',
        //     work_place: 'ธนาคารกรุงเทพ สำนักงานพระราม 3',
        //     role_name: 'Intern'
        // },
        // role: {
        //     // เมนูหลัก
        //     menu_attendance: true,
        //     menu_report: true,
        //     menu_admin: true,
        //     menu_setup: true,

        //     // ฟังก์ชันการทำงาน
        //     func_approve: true,
        //     func_cico: true,

        //     // รายงานต่างๆ
        //     func_rp_attendance: true,
        //     func_rp_work_hours: true,
        //     func_rp_compensation: true,

        //     // ส่วนสำรอง (Spares) สำหรับเมนู
        //     menu_spare1: true,
        //     menu_spare2: true,
        //     menu_spare3: true,
        //     menu_spare4: true,
        //     menu_spare5: true,

        //     // ส่วนสำรอง (Spares) สำหรับฟังก์ชัน
        //     func_spare1: true,
        //     func_spare2: true,
        //     func_spare3: true,
        //     func_spare4: true,
        //     func_spare5: true,
        //     func_spare6: true,
        //     func_spare7: true,
        //     func_spare8: true,
        //     func_spare9: true,
        //     func_spare10: true
        // }
        // };
        if (password !== "" && oaUser !== "") {
            // if (onLogin) {
            //     onLogin(userData);
            //     navigate('/home');
            // }
            const response = await authService.login(oaUser, password);
            try {
                if (response.status === 200) {
                    TokenService.setUser(response.data);
                    navigate('/home');
                } else {
                    setLoginError("login failed");
                }
            } catch (error) {
                setLoginError("login failed");
            }
        }
        setIsLoading(false);
    };
    console.log('Login attempt', { oaUser, password });


    return (
        <div style={{
            backgroundImage: `url(${login_background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="container">
                <div className="row justify-content-center justify-content-lg-end border border-2 border-danger">

                    <div className="col-12 col-md-8 col-lg-5 p-3 border border-2 border-danger">

                        <div className="text-white mb-4 text-center text-lg-start ">
                            <h2 className="fw-bold mb-0" style={{
                                textShadow: '2px 2px 8px rgba(0,0,0,0.6)',
                                fontSize: 'calc(1.3rem + 1vw)',
                                lineHeight: '1.2'
                            }}>
                                Intern Attendance Tracking <br />
                                Management System <img src="./Picture/fluent_calendar-ltr-24-regular.png" alt="calendar" />
                            </h2>
                        </div>

                        <div className="card border-2 shadow-lg border border-2 border-danger" style={{ borderRadius: '18px', backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
                            <div className="card-body p-4 p-md-5 ">
                                <form onSubmit={handleLogin}>
                                    <div className="mb-3 text-start ">
                                        <label className="form-label fw-bold mb-1" style={{ fontSize: '0.9rem' }}>OA User</label>
                                        <input
                                            type="text"
                                            className="form-control bg-light border-2"
                                            placeholder="OA User"
                                            value={oaUser}
                                            onChange={(e) => setOaUser(e.target.value)}
                                            required
                                            style={{ padding: '12px', fontSize: '1rem' }}
                                        />
                                    </div>

                                    <div className="mb-3 text-start">
                                        <label className="form-label fw-bold mb-1" style={{ fontSize: '0.9rem' }}>Password</label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="form-control bg-light border-2"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            style={{ padding: '12px', fontSize: '1rem' }}
                                        />
                                    </div>

                                    <div className="mb-4 form-check text-start">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="showPass"
                                            checked={showPassword}
                                            onChange={() => setShowPassword(!showPassword)}
                                        />
                                        <label className="form-check-label small text-muted" htmlFor="showPass">
                                            Show Password
                                        </label>
                                    </div>

                                    <div className="border border-2 border-danger">{loginError}</div>

                                    <div className="d-grid">
                                        {isLoading ? (
                                            <button className="btn btn-primary fw-bold py-2" type="button" disabled>
                                                <span
                                                    className="spinner-border spinner-border-sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
                                                &nbsp;Loading...
                                            </button>
                                        ) : (
                                            <button type="submit" className="btn btn-primary fw-bold py-2" >
                                                Login
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Signin;