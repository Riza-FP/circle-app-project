import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

const RightSidebar = () => {
    const user = useSelector((state: RootState) => state.auth.user);

    return (
        <div className="fixed right-0 top-0 h-screen w-[300px] p-4 border-l border-gray-800 bg-background flex flex-col space-y-4 overflow-y-auto custom-scrollbar">
            <Card className="bg-gray-900 border-none text-white overflow-hidden">
                <div className="h-20 bg-gradient-to-r from-green-200 to-blue-200" />
                <div className="px-4 pb-4 -mt-8 relative">
                    <div className="flex justify-between items-end mb-4">
                        <Avatar className="w-16 h-16 border-4 border-gray-900 bg-gray-900">
                            <AvatarImage src={user?.avatar} className="object-cover" />
                            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <Button variant="outline" className="rounded-full h-8 text-xs border-white text-white bg-transparent hover:bg-white hover:text-black">
                            Edit Profile
                        </Button>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold truncate">{user?.name || "My Name"}</h3>
                        <p className="text-gray-500 text-sm">@{user?.username || "username"}</p>
                        <p className="mt-2 text-sm line-clamp-2">{user?.bio || "My bio is empty..."}</p>

                        <div className="flex space-x-3 mt-3 text-sm">
                            <div><span className="font-bold">291</span> <span className="text-gray-500">Following</span></div>
                            <div><span className="font-bold">23</span> <span className="text-gray-500">Followers</span></div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="text-[10px] text-gray-500 px-2">
                Developed by Riza Fauzan Pratama • Github • LinkedIn • Instagram
                <br />
                Powered by DumbWays Indonesia • #1 Coding Bootcamp
            </div>
        </div>
    );
};

export default RightSidebar;
