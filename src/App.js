
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-bootstrap-typeahead/css/Typeahead.min.css";
import "./App.css";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "./components/Header/Header";
import Home from "./components/HomePage/home";
import Signin from "./components/Signin/Signin";
import Role from "./components/Setup/Role/Role";
import TokenService from "./services/token.service";

import Listofvalues from "./components/Setup/Listofvalues/Listofvalues";
import Holidays from "./components/Setup/Holidays/Holidays";
import Breadcrumb from "./components/Utilities/Breadcrumb";
import Notification from "./components/Utilities/Notification";
import UserManage from "./components/Admin/UserManage/UserManage";
import CheckInOut from "./components/Attendance/CheckIn-Out/CheckIn-Out";
import AttendanceLeaveMange from "./components/Attendance/AttendanceLeaveManage/AttendanceLeaveMange";
import AttendanceApproval from "./components/Attendance/AttendanceApproval/AttendanceApproval";
import AttendanceHistory from "./components/Report/AttendanceHistory/Attendance History";
import WorkHours from "./components/Report/WorkHours/WorkHours";
import Compensation from "./components/Report/Compensation/Compensation";


function App() {

  const location = useLocation();
  // const [isAuth, setIsAuth] = useState(TokenService.isSignIn());
  // useEffect(() => {
  //   setIsAuth(TokenService.isSignIn());
  // }, [location.pathname]); 

  const isAuth = TokenService.isSignIn();

  console.log("location: ", location.pathname);
  console.log("is auth: ", isAuth);
  return (
    <div className="container-fluid px-0">
      <header>
        {<Header />}
      </header>
      {isAuth && <Breadcrumb />}
      <main>
        <Notification />
        <div className="content">
          <Routes>
            <Route
              path="/signin"
              element={isAuth ? <Navigate to="/home" title="Sign-in" replace /> : <Signin title="Sign-in" />}
            />

            <Route path="/" element={
              <Home title="Home" />
            } />
            <Route path="/home" element={
              <Home title="Home" />
            } />
            <Route path="/setup/role" element={
              <Role title="Role" />
            } />

            <Route path="/setup/manage-list-of-values" element={
              <Listofvalues title="List of values" />
            } />

            <Route path="/admin/user-management" element={
              <UserManage title="User Management" />
            } />

            <Route path="/setup/manage-holidays" element={
              <Holidays title="Holidays" />
            } />

            <Route path="/attendance/Check-In-&-Check-Out" element={
              <CheckInOut title="Check-In & Check-Out" />
            } />

            <Route path="/attendance/Attendance-&-Leave-Management" element={
              <AttendanceLeaveMange title="Attendance & Leave Management" />
            } />

            <Route path="/attendance/Attendance-&-Leave-Approval" element={
              <AttendanceApproval title="Attendance & Leave Approval" />
            } />

            <Route path="/report/AttendanceHistory" element={
              <AttendanceHistory title="Attendance History" />
            } />

            <Route path="/report/WorkHours" element={
              <WorkHours title="Work Hours" />
            } />

            <Route path="/report/Compensation" element={
              <Compensation title="Compensation" />
            } />

            <Route path="*" element={<Navigate to={isAuth ? "/Home" : "/signin"} title="Sign-in" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;
