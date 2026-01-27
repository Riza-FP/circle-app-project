import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

import { useState, useEffect } from "react";
import EditProfileModal from "./EditProfileModal";
import { getAvatarUrl } from "../utils/imageUtils";
import { getSuggestedUsers } from "../services/userApi";
import FollowCard from "./FollowCard";

const RightSidebar = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [isEditOpen, setIsEditOpen] = useState(false);

    return (
        <div className="w-[400px] p-6 border-l border-gray-800 bg-background flex flex-col space-y-6">
            <Card className="bg-gray-900 border-none text-white overflow-hidden shrink-0">
                <div
                    className="h-28 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: user?.cover_photo
                            ? `url(${getAvatarUrl(user.cover_photo)})`
                            : 'linear-gradient(to right, #badefc, #fca5a5)'
                    }}
                />
                <div className="px-5 pb-6 -mt-10 relative">
                    <div className="flex justify-between items-end mb-4">
                        <Avatar className="w-20 h-20 border-4 border-gray-900 bg-gray-900">
                            <AvatarImage
                                src={getAvatarUrl(user?.avatar)}
                                className="object-cover"
                            />
                            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <Button
                            variant="outline"
                            className="rounded-full h-8 text-xs border-white text-white bg-transparent hover:bg-white hover:text-black"
                            onClick={() => setIsEditOpen(true)}
                        >
                            Edit Profile
                        </Button>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold truncate">{user?.name || "My Name"}</h3>
                        <p className="text-gray-500 text-sm">@{user?.username || "username"}</p>
                        <p className="mt-3 text-sm leading-relaxed min-h-[40px]">{user?.bio || "My bio is empty..."}</p>

                        <div className="flex space-x-4 mt-4 text-sm">
                            <div><span className="font-bold text-white">{user?.following_count || 0}</span> <span className="text-gray-500">Following</span></div>
                            <div><span className="font-bold text-white">{user?.follower_count || 0}</span> <span className="text-gray-500">Followers</span></div>
                        </div>
                    </div>
                </div>
            </Card>

            <EditProfileModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                user={user}
            />

            <Card className="bg-gray-900 border-none text-white p-4 shrink-0">
                <h3 className="font-bold mb-4">Suggested for you</h3>
                <div className="flex flex-col space-y-4">
                    <SuggestedUsersList />
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

const SuggestedUsersList = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggested = async () => {
            try {
                const res = await getSuggestedUsers();
                setUsers(res.data.data);
            } catch (error) {
                console.error("Failed to fetch suggested users", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggested();
    }, []);

    if (loading) return <div className="text-gray-500 text-sm">Loading...</div>;
    if (users.length === 0) return <div className="text-gray-500 text-sm">No suggestions available.</div>;

    return (
        <>
            {users.map(user => (
                <FollowCard key={user.id} user={user} />
            ))}
        </>
    );
};

export default RightSidebar;
