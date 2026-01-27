import type { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import RightSidebar from "../components/RightSidebar";

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div className="flex min-h-screen max-w-[1580px] mx-auto">
            <div className="w-[290px] flex-shrink-0 hidden md:block">
                <Sidebar />
            </div>
            <main className="flex-1 border-x border-neutral-700 min-w-[500px]">
                {children}
            </main >

            <div className="w-[400px] flex-shrink-0 hidden lg:block">
                <RightSidebar />
            </div>
        </div >
    );
};

export default MainLayout;

