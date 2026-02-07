
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-bootstrap-typeahead/css/Typeahead.min.css";
import "./App.css";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "./components/Header/Header";
import Home from "./components/HomePage/Home";
import Signin from "./components/Signin/Signin";
import Role from "./components/Role/Role";
import TokenService from "./services/token.service";
import TableUI from "./components/Utilities/TableTennis";
import Listofvalues from "./components/Listofvalues/Listofvalues";
import BreadCrumb from "./components/Utilities/Breadcrumb";
import Notification from "./components/Utilities/Notification";

const ProtectedRoute = ({ isAuth, children }) => {
  if (!isAuth) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

function App() {

  const location = useLocation();
  const [isAuth, setIsAuth] = useState(TokenService.isSignIn());

  useEffect(() => {
    setIsAuth(TokenService.isSignIn());
  }, [location.pathname]); // เปลี่ยนหน้าเมื่อไหร่ เช็คใหม่

  console.log("location: ", location.pathname);
  console.log("is auth: ", isAuth);
  return (
    <div className="container-fluid px-0">
      <header>
        {isAuth && <Header onLogout={() => setIsAuth(false)} />}
      </header>
      {isAuth && <BreadCrumb />}
      <main>


        <Notification />
        <div className="content">
          <Routes>
            <Route
              path="/signin"
              element={isAuth ? <Navigate to="/Home" replace /> : <Signin title="Sign-in" />}
            />

            <Route path="/" element={
              <ProtectedRoute isAuth={isAuth}>
                <Home />
              </ProtectedRoute>
            } />

            <Route path="/Home" element={
              <ProtectedRoute isAuth={isAuth}>
                <Home />
              </ProtectedRoute>
            } />


            <Route path="/setup/role" element={
              <ProtectedRoute isAuth={isAuth}>
                <Role />
              </ProtectedRoute>
            } />

            <Route path="/setup/lov" element={
              <ProtectedRoute isAuth={isAuth}>
                <Listofvalues />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to={isAuth ? "/Home" : "/signin"} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;
