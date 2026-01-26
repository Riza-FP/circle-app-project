import { useEffect, useState, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Image, X } from "lucide-react";
import ThreadCard from "../components/ThreadCard";
import ReplyCard from "../components/ReplyCard";
import { getThreadById, createReply, getReplies } from "../services/threadApi";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store/store";
import { upsertThread } from "../store/threadSlice";
import MainLayout from "../layout/MainLayout";
import { WebSocketContext } from "../contexts/WebSocketContext";

const ThreadDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<any>(); // Add dispatch
    const user = useSelector((state: RootState) => state.auth.user);
    const { setSuccessMessage, newReply } = useContext(WebSocketContext)!;

    // Select thread from Redux store
    const threadFromStore = useSelector((state: RootState) =>
        state.threads.list.find(t => t.id === Number(id))
    );


    const [localThread, setLocalThread] = useState<any>(null); // Rename to localThread
    const [replies, setReplies] = useState<any[]>([]);
    const [replyContent, setReplyContent] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isPostingReply, setIsPostingReply] = useState(false);

    // Use thread from store if available, otherwise local state
    const thread = threadFromStore || localThread;

    // Image Upload State
    const [replyImages, setReplyImages] = useState<File[]>([]);
    // ...
    const [replyPreviews, setReplyPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchData = async () => {
        if (!id) return;
        try {
            setIsLoading(true);
            const [threadRes, repliesRes] = await Promise.all([
                getThreadById(Number(id)),
                getReplies(Number(id))
            ]);
            setLocalThread(threadRes.data.data);
            dispatch(upsertThread(threadRes.data.data)); // Sync thread with Redux
            setReplies(repliesRes.data.data.replies);
        } catch (error) {
            console.error("Failed to fetch thread details", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    // Real-time reply update
    useEffect(() => {
        if (newReply && newReply.threadId === Number(id)) {
            // Check if reply already exists to avoid duplicates (though duplication unlikely with simple append unless event fires twice)
            setReplies(prev => {
                if (prev.find(r => r.id === newReply.data.id)) return prev;
                return [newReply.data, ...prev]; // Prepend or append? Usually replies are chronological?
                // API sorts by createdAt desc (newest first). So we should prepend?
                // Wait, default sort in getReplies: orderBy: { createdAt: "desc" }
                // So mappedReplies has newest first.
                // So we should prepend newReply.data.
            });
        }
    }, [newReply, id]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = Array.from(files);
            setReplyImages((prev) => [...prev, ...newFiles]);

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setReplyPreviews((prev) => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setReplyImages((prev) => prev.filter((_, i) => i !== index));
        setReplyPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleReply = async () => {
        if ((!replyContent.trim() && replyImages.length === 0) || !id) return;
        setIsPostingReply(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const formData = new FormData();
            formData.append("thread_id", id);
            formData.append("content", replyContent);
            replyImages.forEach((image) => {
                formData.append("images", image);
            });

            await createReply(formData);

            setReplyContent("");
            setReplyImages([]);
            setReplyPreviews([]);

            setSuccessMessage("Reply posted successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);

            // Refresh replies
            const repliesRes = await getReplies(Number(id));
            setReplies(repliesRes.data.data.replies);
        } catch (error) {
            console.error("Failed to post reply", error);
        } finally {
            setIsPostingReply(false);
        }
    };

    return (
        <MainLayout>
            <div className="text-white">
                <div className="flex items-center gap-4 p-4 border-b border-gray-800 sticky top-0 bg-black/80 backdrop-blur-md z-10 transition-all duration-200">
                    <button
                        onClick={() => navigate(-1)}
                        className="hover:bg-gray-800/50 p-2 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold">Thread</h1>
                </div>

                {isLoading ? (
                    // Silent loading
                    <div className="p-4 text-center text-gray-500"></div>
                ) : !thread ? (
                    <div className="text-white text-center mt-10">Thread not found</div>
                ) : (
                    <>
                        <div className="px-4 pt-4">
                            <div className="border-b border-gray-800 pb-2">
                                <ThreadCard thread={thread} hideReplyButton={true} />
                            </div>
                        </div>

                        <div className="p-4 border-b border-gray-800">
                            <div className="flex gap-3">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={user?.avatar} />
                                    <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <textarea
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder="Post your reply"
                                        className="w-full bg-transparent border-none outline-none text-lg resize-none min-h-[50px] placeholder-gray-500"
                                    />

                                    {replyPreviews.length > 0 && (
                                        <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                                            {replyPreviews.map((preview, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={preview}
                                                        alt="Preview"
                                                        className="h-20 w-20 object-cover rounded-lg border border-gray-800"
                                                    />
                                                    <button
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 bg-black rounded-full p-0.5 border border-gray-700"
                                                    >
                                                        <X className="w-3 h-3 text-white" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center mt-2 border-t border-gray-800 pt-2">
                                        <div className="flex items-center">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageChange}
                                                className="hidden"
                                                accept="image/*"
                                                multiple
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-green-500 hover:text-green-400 p-2 rounded-full hover:bg-green-500/10 transition-colors"
                                            >
                                                <Image className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <Button
                                            onClick={handleReply}
                                            disabled={(!replyContent.trim() && replyImages.length === 0) || isPostingReply}
                                            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6"
                                        >
                                            {isPostingReply ? "Posting..." : "Reply"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pb-20">
                            {replies.map((reply) => (
                                <ReplyCard key={reply.id} reply={reply} onRefresh={fetchData} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </MainLayout>
    );
};

export default ThreadDetail;
