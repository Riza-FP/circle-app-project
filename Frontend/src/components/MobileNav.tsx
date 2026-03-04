import { Link, useLocation } from "react-router-dom";
import { Home, Search, Heart, User, Plus } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import CreateThread from "./CreateThread";

const MobileNav = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const location = useLocation();

    const navItems = [
        { icon: Home, label: "Home", path: "/home" },
        { icon: Search, label: "Search", path: "/search" },
        { icon: Heart, label: "Follows", path: "/follows" },
        { icon: User, label: "Profile", path: `/profile/${user?.id || user?.user_id}` },
    ];

    return (
        <div className="md:hidden fixed bottom-0 w-full bg-black border-t border-gray-800 z-50">
            <nav className="flex justify-around items-center h-16 safe-area-pb">
                {navItems.slice(0, 2).map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex flex-col items-center justify-center w-full h-full p-2 transition-colors ${isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
                                }`}
                        >
                            <item.icon className={`w-6 h-6 ${isActive ? "text-white" : ""}`} />
                        </Link>
                    );
                })}

                {/* Floating Action Button - Center */}
                <div className="flex flex-col items-center justify-center w-full h-full -mt-5">
                    <CreateThread>
                        <button className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-105">
                            <Plus className="w-6 h-6" />
                        </button>
                    </CreateThread>
                </div>

                {navItems.slice(2, 4).map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex flex-col items-center justify-center w-full h-full p-2 transition-colors ${isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
                                }`}
                        >
                            <item.icon className={`w-6 h-6 ${isActive ? "text-white" : ""}`} />
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default MobileNav;
