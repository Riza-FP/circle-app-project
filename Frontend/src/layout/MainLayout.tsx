import type { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import RightSidebar from "../components/RightSidebar";
import MobileNav from "../components/MobileNav";

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div className="flex min-h-screen max-w-[1580px] mx-auto">
            <div className="w-[290px] flex-shrink-0 hidden md:block">
                <Sidebar />
            </div>
            <main className="flex-1 w-full sm:min-w-[500px] border-x border-neutral-700 pb-20 md:pb-0">
                {children}
            </main >

            <div className="w-[400px] flex-shrink-0 hidden lg:block">
                <RightSidebar />
            </div>

            <MobileNav />
        </div >
    );
};

export default MainLayout;

