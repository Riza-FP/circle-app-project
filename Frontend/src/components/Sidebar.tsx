import { Link, useLocation } from "react-router-dom";
import { Home, Search, Heart, User, LogOut } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { RootState } from "../store/store";

import CreateThread from "./CreateThread";

const Sidebar = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    };

    const navItems = [
        { icon: Home, label: "Home", path: "/home" },
        { icon: Search, label: "Search", path: "/search" },
        { icon: Heart, label: "Follows", path: "/follows" },
        { icon: User, label: "Profile", path: `/profile/${user?.id || user?.user_id}` },
    ];

    return (
        <div className="flex flex-col h-screen fixed left-0 top-0 w-[250px] p-6 border-r border-gray-800 bg-background">
            <h1 className="text-4xl font-bold text-green-500 mb-8 pl-2">circle</h1>

            <nav className="flex-1 space-y-4">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex items-center space-x-4 p-3 rounded-full transition-colors ${isActive ? "text-white font-bold" : "text-gray-400 hover:bg-gray-900"
                                }`}
                        >
                            <item.icon className={`w-7 h-7 ${isActive ? "text-white" : ""}`} />
                            <span className="text-xl">{item.label}</span>
                        </Link>
                    );
                })}

                <CreateThread>
                    <Button className="w-full bg-green-500 hover:bg-green-600 text-white rounded-full py-6 text-xl font-bold mt-8">
                        Create Post
                    </Button>
                </CreateThread>
            </nav>

            <button
                onClick={handleLogout}
                className="flex items-center space-x-3 text-gray-400 hover:text-white mt-auto pl-3"
            >
                <LogOut className="w-6 h-6" />
                <span className="text-lg">Logout</span>
            </button>
        </div>
    );
};

export default Sidebar;
