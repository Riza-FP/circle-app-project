import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle } from "lucide-react";
import { likeThread, unlikeThread } from "../services/threadApi";
import { useDispatch } from "react-redux";
import { fetchThreads } from "../store/threadSlice";

interface ThreadCardProps {
    thread: any;
}

const ThreadCard = ({ thread }: ThreadCardProps) => {
    const dispatch = useDispatch<any>();

    const handleLike = async (e: React.MouseEvent, id: number, isLiked: boolean) => {
        e.stopPropagation();
        try {
            if (isLiked) {
                await unlikeThread(id);
            } else {
                await likeThread(id);
            }
            dispatch(fetchThreads());
        } catch (error) {
            console.error("Failed to like/unlike", error);
        }
    };

    return (
        <div className="flex space-x-4 p-4 border-b border-gray-800 hover:bg-white/5 transition-colors cursor-pointer">
            <Avatar className="w-10 h-10 rounded-full">
                <AvatarImage src={thread.user.profile_picture} className="object-cover" />
                <AvatarFallback>{thread.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center space-x-2">
                    <span className="font-bold">{thread.user.name}</span>
                    <span className="text-gray-500">@{thread.user.username}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500 text-sm">
                        {thread.created_at
                            ? formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })
                            : "just now"}
                    </span>
                </div>

                <p className="mt-2 text-white/90 leading-relaxed font-light">
                    {thread.content}
                </p>

                {thread.image && (
                    <img
                        src={thread.image}
                        alt="Thread attachment"
                        className="mt-3 rounded-lg border border-gray-800 max-h-[400px] object-cover"
                    />
                )}

                <div className="flex items-center space-x-6 mt-4 text-gray-500">
                    <button
                        onClick={(e) => handleLike(e, thread.id, thread.isLiked)}
                        className={`flex items-center space-x-2 group ${thread.isLiked ? "text-red-500" : "hover:text-red-500"
                            }`}
                    >
                        <Heart className={`w-5 h-5 ${thread.isLiked ? "fill-current" : ""}`} />
                        <span className="text-sm">{thread.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 group hover:text-blue-500">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm">{thread.reply} Replies</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThreadCard;
