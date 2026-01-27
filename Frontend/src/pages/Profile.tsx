import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getUserById } from "../services/userApi";
import { followUser, unfollowUser } from "../services/followApi";
import { getThreadsByUser } from "../services/threadApi";
import { ArrowLeft, Loader2 } from "lucide-react";
import ThreadCard from "../components/ThreadCard";
import EditProfileModal from "../components/EditProfileModal";
import { getAvatarUrl } from "../utils/imageUtils";

const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useSelector((state: any) => state.auth);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // State for other user
    const [otherUser, setOtherUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    // User threads state
    const [threads, setThreads] = useState<any[]>([]);
    const [threadsLoading, setThreadsLoading] = useState(false);

    const [activeTab, setActiveTab] = useState<"posts" | "media">("posts");

    const isOwnProfile = !id || currentUser?.id === parseInt(id) || currentUser?.user_id === parseInt(id);

    // Fetch user fetching logic for "Other User"
    useEffect(() => {
        if (!isOwnProfile && id) {
            const fetchUser = async () => {
                setLoading(true);
                try {
                    const res = await getUserById(parseInt(id));
                    setOtherUser(res.data.data);
                } catch (error) {
                    console.error("Failed to fetch user:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchUser();
        } else {
            setOtherUser(null);
        }
    }, [id, isOwnProfile]);

    const displayUser = isOwnProfile ? currentUser : otherUser;

    // Fetch threads when user logic is settled
    useEffect(() => {
        const fetchThreads = async () => {
            const targetId = isOwnProfile ? (currentUser?.id || currentUser?.user_id) : id ? parseInt(id) : null;

            if (!targetId) return;

            setThreadsLoading(true);
            try {
                const res = await getThreadsByUser(targetId, activeTab === "media" ? "media" : undefined);
                setThreads(res.data.threads);
            } catch (error) {
                console.error("Failed to fetch threads:", error);
            } finally {
                setThreadsLoading(false);
            }
        };

        if (displayUser) {
            fetchThreads();
        }
    }, [displayUser, id, isOwnProfile, currentUser, activeTab]);


    const handleFollowToggle = async () => {
        if (!otherUser) return;
        setFollowLoading(true);
        try {
            if (otherUser.is_following) {
                await unfollowUser(otherUser.id);
                setOtherUser((prev: any) => ({
                    ...prev,
                    is_following: false,
                    follower_count: prev.follower_count - 1
                }));
            } else {
                await followUser(otherUser.id);
                setOtherUser((prev: any) => ({
                    ...prev,
                    is_following: true,
                    follower_count: prev.follower_count + 1
                }));
            }
        } catch (error) {
            console.error("Failed to toggle follow:", error);
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-screen text-white">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            </MainLayout>
        );
    }

    if (!displayUser && !loading) {
        return (
            <MainLayout>
                <div className="text-white text-center mt-20">User not found.</div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="w-full text-white min-h-screen border-r border-gray-800">
                <div className="pb-4">
                    <div className="flex items-center gap-4 px-4 pt-4 mb-2">
                        <button onClick={() => navigate(-1)} className="hover:bg-gray-800 p-2 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold">
                            {displayUser?.name}
                        </h1>
                    </div>

                    {/* Cover Photo */}
                    <div className="h-48 bg-gray-700 w-full relative">
                        {displayUser?.cover_photo && (
                            <img
                                src={getAvatarUrl(displayUser.cover_photo)}
                                alt="Cover"
                                className="w-full h-full object-cover"
                            />
                        )}
                        <div className="absolute -bottom-16 left-4">
                            <Avatar className="w-32 h-32 border-4 border-black rounded-full">
                                <AvatarImage
                                    src={getAvatarUrl(displayUser?.avatar)}
                                    className="object-cover"
                                />
                                <AvatarFallback className="text-4xl text-black">{displayUser?.name?.[0]}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex justify-end p-4 h-16">
                        {isOwnProfile ? (
                            <Button
                                variant="outline"
                                className="rounded-full border-gray-600 text-white hover:bg-white/10"
                                onClick={() => setIsEditOpen(true)}
                            >
                                Edit Profile
                            </Button>
                        ) : (
                            <Button
                                variant={displayUser?.is_following ? "outline" : "default"}
                                className={`rounded-full px-6 ${displayUser?.is_following
                                    ? "text-gray-400 border-gray-600 hover:text-white hover:border-gray-400 bg-transparent"
                                    : "bg-white text-black hover:bg-gray-200"
                                    }`}
                                onClick={handleFollowToggle}
                                disabled={followLoading}
                            >
                                {displayUser?.is_following ? "Following" : "Follow"}
                            </Button>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="px-4 mt-4 space-y-3">
                        <div>
                            <h2 className="text-2xl font-bold">{displayUser?.name}</h2>
                            <p className="text-gray-500">@{displayUser?.username}</p>
                        </div>

                        <p className="">{displayUser?.bio || "No bio yet."}</p>

                        <div className="flex space-x-4 text-sm text-gray-500">
                            <span><strong className="text-white">{displayUser?.following_count || 0}</strong> Following</span>
                            <span><strong className="text-white">{displayUser?.follower_count || 0}</strong> Followers</span>
                        </div>
                    </div>

                    {/* Tabs Placeholder */}
                    <div className="flex border-b border-gray-800 mt-4">
                        <div
                            className={`flex-1 text-center py-4 font-bold cursor-pointer hover:bg-white/5 transition border-b-4 ${activeTab === 'posts' ? 'border-green-500 text-white' : 'border-transparent text-gray-500'}`}
                            onClick={() => setActiveTab("posts")}
                        >
                            All Post
                        </div>
                        <div
                            className={`flex-1 text-center py-4 font-bold cursor-pointer hover:bg-white/5 transition border-b-4 ${activeTab === 'media' ? 'border-green-500 text-white' : 'border-transparent text-gray-500'}`}
                            onClick={() => setActiveTab("media")}
                        >
                            Media
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {threadsLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                            </div>
                        ) : threads.length > 0 ? (
                            activeTab === "media" ? (
                                <div className="grid grid-cols-3 gap-1">
                                    {threads.map((thread) => (
                                        thread.images && thread.images.length > 0 && thread.images.map((img: string, idx: number) => (
                                            <div key={`${thread.id}-${idx}`} className="aspect-square relative group cursor-pointer" onClick={() => navigate(`/thread/${thread.id}`)}>
                                                <img
                                                    src={getAvatarUrl(img)}
                                                    alt="Media"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))
                                    ))}
                                </div>
                            ) : (
                                threads.map((thread) => (
                                    <ThreadCard key={thread.id} thread={thread} />
                                ))
                            )
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                {activeTab === "media" ? "No photos or videos yet." : (isOwnProfile ? "Your posts will appear here." : "This user hasn't posted anything yet.")}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isOwnProfile && (
                <EditProfileModal
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    user={currentUser}
                />
            )}
        </MainLayout>
    );
};

export default Profile;
