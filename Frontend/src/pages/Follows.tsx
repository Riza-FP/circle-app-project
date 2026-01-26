import { useState, useEffect } from "react";
import MainLayout from "../layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFollows } from "../services/followApi";
import FollowCard from "../components/FollowCard";
import { Loader2 } from "lucide-react";

const Follows = () => {
    const [followers, setFollowers] = useState<any[]>([]);
    const [following, setFollowing] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFollows = async () => {
        setLoading(true);
        try {
            const followersRes = await getFollows("followers");
            const followingRes = await getFollows("following");

            setFollowers(followersRes.data.data.followers);
            setFollowing(followingRes.data.data.followers);
        } catch (error) {
            console.error("Failed to fetch follows:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFollows();
    }, []);

    return (
        <MainLayout>
            <div className="w-full text-white min-h-screen border-r border-gray-800">
                <h1 className="text-xl font-bold p-4 border-b border-gray-800">Follows</h1>

                <Tabs defaultValue="followers" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-transparent border-b border-gray-800 rounded-none p-0 h-auto">
                        <TabsTrigger
                            value="followers"
                            className="py-4 border-b-4 border-transparent data-[state=active]:border-green-500 rounded-none text-gray-500 data-[state=active]:text-white font-bold transition-all"
                        >
                            Followers
                        </TabsTrigger>
                        <TabsTrigger
                            value="following"
                            className="py-4 border-b-4 border-transparent data-[state=active]:border-green-500 rounded-none text-gray-500 data-[state=active]:text-white font-bold transition-all"
                        >
                            Following
                        </TabsTrigger>
                    </TabsList>

                    <div className="p-0">
                        {loading ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                            </div>
                        ) : (
                            <>
                                <TabsContent value="followers" className="m-0">
                                    {followers.length > 0 ? (
                                        followers.map((user) => (
                                            <FollowCard key={user.id} user={user} />
                                        ))
                                    ) : (
                                        <div className="text-center text-gray-500 py-8">
                                            No followers yet.
                                        </div>
                                    )}
                                </TabsContent>
                                <TabsContent value="following" className="m-0">
                                    {following.length > 0 ? (
                                        following.map((user) => (
                                            <FollowCard key={user.id} user={user} />
                                        ))
                                    ) : (
                                        <div className="text-center text-gray-500 py-8">
                                            You are not following anyone yet.
                                        </div>
                                    )}
                                </TabsContent>
                            </>
                        )}
                    </div>
                </Tabs>
            </div>
        </MainLayout>
    );
};

export default Follows;
