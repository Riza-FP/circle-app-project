import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store/store";
import { fetchProfile } from "../features/auth/authSlice";
import { useEffect } from "react";

const PrivateRoute = () => {
    const { token, user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<any>();

    useEffect(() => {
        if (token && user && user.follower_count === undefined) {
            dispatch(fetchProfile());
        }
    }, [token, user, dispatch]);

    if (!token) {
        return <Navigate to="/" replace state={{ message: "Please login to continue" }} />;
    }

    return <Outlet />;
};



export default PrivateRoute;
