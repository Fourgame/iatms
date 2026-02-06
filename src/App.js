
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-bootstrap-typeahead/css/Typeahead.min.css";
import "./App.css";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "./components/Header/Header";
import Home from "./components/Home/Home";
import Signin from "./components/Signin/Signin";
import TokenService from "./services/token.service";
import TableUI from "./components/Utilities/TableTennis";
import Listofvalues from "./components/Listofvalues/Listofvalues";
import BreadCrumb from "./components/Utilities/Breadcrumb";
import Role from "./components/Role/Role";




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
        <div className="content">
          <Routes>

            <Route path="/"
              element={<Signin title="Sign-in" />} />

            <Route path="/signin"
              element={<Signin title="Sign-in" />} />
{/* 
            <Route path="/table"
              element={<TableUI />} /> */}

            <Route path="/setup/lov"
              element={<Listofvalues />} />

            <Route path="/Home"
              element={<Home />} />

            <Route path="/setup/role"
              element={<Role />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;
