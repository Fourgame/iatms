
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
import Role from "./components/Role/Role";
import TokenService from "./services/token.service";
import TableUI from "./components/Utilities/TableTennis";
import Listofvalues from "./components/Listofvalues/Listofvalues";
import Holidays from "./components/Holidays/Holidays";
import Breadcrumb from "./components/Utilities/Breadcrumb";
import Notification from "./components/Utilities/Notification";


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
        {isAuth && <Header />}
      </header>
      {isAuth && <Breadcrumb />}
      <main>



        <Notification />
        <div className="content">
          <Routes>
            <Route
              path="/signin"
              element={isAuth ? <Navigate to="/Home" replace /> : <Signin title="Sign-in" />}
            />

            <Route path="/" element={
                <Signin />
            } />

            <Route path="/Home" element={
                <Home />
            } />


            <Route path="/setup/role" element={
              <Role />
            } />

            <Route path="/setup/Manage-List-of-Values" element={
              <Listofvalues />
            } />

            <Route path="/setup/manage-holidays" element={
              <Holidays />
            } />

            <Route path="*" element={<Navigate to={isAuth ? "/Home" : "/signin"} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;
