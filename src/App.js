
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-bootstrap-typeahead/css/Typeahead.min.css";
import "./App.css";

import { Routes, Route, Navigate,useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "./components/Header/Header";
import Home from "./components/Home/Home";
import Signin from "./components/Signin/Signin";
import TokenService from "./services/token.service";



function App() {

  const location = useLocation();
  const [isAuth, setIsAuth] = useState(TokenService.isSignIn());
  
  useEffect(() => {
    setIsAuth(TokenService.isSignIn());
  }, [location.pathname]); // เปลี่ยนหน้าเมื่อไหร่ เช็คใหม่

  console.log("location: ",location.pathname);
  console.log("is auth: ",isAuth);
  return (
    <div className="container-fluid px-0">
      <header>
        {isAuth && <Header onLogout={() => setIsAuth(false)} />}
      </header>
      <main>
        <div className="content">
          <Routes>
            <Route path="/" element={<Signin title="Sign-in" />} />
            <Route path="/signin" element={<Signin title="Sign-in" />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;
