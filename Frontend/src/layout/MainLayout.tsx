import type { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import RightSidebar from "../components/RightSidebar";

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div className="flex min-h-screen bg-black text-white">

            <div className="w-[250px] flex-shrink-0">
                <Sidebar />
            </div>


            <main className="flex-1 w-full border-x border-gray-800 min-h-screen">
                {children}
            </main>

            <div className="w-[300px] flex-shrink-0">
                <RightSidebar />
            </div>
        </div>
    );
};

export default MainLayout;
