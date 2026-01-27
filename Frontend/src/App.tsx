import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ThreadDetail from "./pages/ThreadDetail";
import Search from "./pages/Search";
import Follows from "./pages/Follows";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";

import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { authCheck } from "./features/auth/authSlice";

import { Toaster } from "@/components/ui/sonner";

function App() {
  const dispatch = useDispatch<any>();

  useEffect(() => {
    dispatch(authCheck());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<PrivateRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/follows" element={<Follows />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/thread/:id" element={<ThreadDetail />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
