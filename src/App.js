import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Signin from './components/Signin/Signin';
import Header from './components/Header/Header';
import Footer from './components/Header/Footer';
import Home from './components/Home/home';

// Placeholder components for missing files
const Breadcrumb = () => <div></div>;
const Notification = () => <div></div>;
const DefineUsers = () => <div>Define Users Page</div>;
const AccessDenied = () => <div>Access Denied</div>;


const App = () => {

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });


  const handleLogout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  return (
    <div >
      <header>
        <Header currentUser={currentUser} onLogout={handleLogout} />
      </header>
      <main>
        <Breadcrumb />
        <Notification />
        <div className="content">
          <Routes>
            <Route path="/" element={<Signin />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/home" element={<Home />} />
            <Route
              path="/administrator/define-users"
              element={<DefineUsers />}
            />

            <Route path="/access-denied" element={<AccessDenied />} />
          </Routes>
        </div>
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default App;
