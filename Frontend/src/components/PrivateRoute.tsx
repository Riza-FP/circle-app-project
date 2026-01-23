import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store/store";
import { resetJustLoggedOut } from "../features/auth/authSlice";
import { useEffect } from "react";

const PrivateRoute = () => {
    const { token, justLoggedOut } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!token && justLoggedOut) {
            dispatch(resetJustLoggedOut());
        }
    }, [token, justLoggedOut, dispatch]);

    if (!token) {
        if (justLoggedOut) {
            return <Navigate to="/" replace />;
        }
        return <Navigate to="/" replace state={{ message: "Please login to continue" }} />;
    }

    return <Outlet />;
};

export default PrivateRoute;
