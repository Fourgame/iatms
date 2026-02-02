
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-bootstrap-typeahead/css/Typeahead.min.css";
import "./App.css";
import TokenService from "./services/token.service";

import Header from "./components/Header/Header";
import Home from "./components/Home/Home";
import Signin from "./components/Signin/Signin";

import { Routes, Route, Navigate } from "react-router-dom";

function App() {
  console.log(TokenService.isSignIn());
  return (
    <div className="container-fluid px-0">
      <header>
        {<Header />}
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
