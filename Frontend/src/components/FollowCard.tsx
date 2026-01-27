import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "../utils/imageUtils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { followUser, unfollowUser } from "../services/followApi";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

interface FollowCardProps {
    user: {
        id: number;
        username: string;
        name: string;
        avatar?: string | null;
        is_following: boolean;
    };
}

const FollowCard = ({ user }: FollowCardProps) => {
    const [isFollowing, setIsFollowing] = useState(user.is_following);
    const [loading, setLoading] = useState(false);
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const navigate = useNavigate();

    const handleFollowToggle = async () => {
        setLoading(true);
        try {
            if (isFollowing) {
                await unfollowUser(user.id);
                setIsFollowing(false);
            } else {
                await followUser(user.id);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error("Failed to toggle follow status:", error);
        } finally {
            setLoading(false);
        }
    };

    // Hide follow button if it's the current user
    const isMe = currentUser?.id === user.id || currentUser?.user_id === user.id;

    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => navigate(`/profile/${user.id}`)}
            >
                <Avatar className="w-10 h-10 border border-gray-700">
                    <AvatarImage src={getAvatarUrl(user.avatar)} className="object-cover" />
                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <h4 className="text-white font-bold text-sm hover:underline">{user.name}</h4>
                    <p className="text-gray-500 text-xs">@{user.username}</p>
                </div>
            </div>

            {!isMe && (
                <Button
                    variant={isFollowing ? "outline" : "default"}
                    className={`rounded-full h-8 text-xs px-4 ${isFollowing
                        ? "text-gray-400 border-gray-600 hover:text-white hover:border-gray-400 bg-transparent"
                        : "bg-white text-black hover:bg-gray-200"
                        }`}
                    onClick={handleFollowToggle}
                    disabled={loading}
                >
                    {isFollowing ? "Following" : "Follow"}
                </Button>
            )}
        </div>
    );
};

export default FollowCard;
