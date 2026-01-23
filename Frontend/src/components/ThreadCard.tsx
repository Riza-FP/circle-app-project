import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Edit, Heart, Image as ImageIcon, MessageCircle, MoreHorizontal, Trash, X } from "lucide-react";
import { deleteThread, updateThread } from "../services/threadApi";
import { useDispatch, useSelector } from "react-redux";
import { fetchThreads, likeThreadOptimistic, unlikeThreadOptimistic } from "../store/threadSlice";
import type { RootState } from "../store/store";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WebSocketContext } from "../contexts/WebSocketContext";

interface ThreadCardProps {
    thread: any;
    hideReplyButton?: boolean;
}

const ThreadCard = ({ thread, hideReplyButton }: ThreadCardProps) => {
    const dispatch = useDispatch<any>();
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const { setSuccessMessage } = useContext(WebSocketContext)!;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editContent, setEditContent] = useState(thread.content);
    const [editImages, setEditImages] = useState<File[]>([]);
    const [editPreviews, setEditPreviews] = useState<string[]>(
        thread.images ? thread.images.map((img: string) => img.startsWith("http") ? img : `http://localhost:5000${img}`) : []
    );
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const isAuthor = (currentUser?.id || currentUser?.user_id) === thread.user.id;

    const handleLike = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (thread.isLiked) {
            dispatch(unlikeThreadOptimistic(id));
        } else {
            dispatch(likeThreadOptimistic(id));
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteThread(thread.id);
            setSuccessMessage("Thread deleted successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);
            dispatch(fetchThreads());
            setIsDeleteOpen(false);
        } catch (error) {
            console.error("Failed to delete thread", error);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = Array.from(files);
            setEditImages(newFiles);
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setEditPreviews(newPreviews);
        }
    };

    const handleUpdate = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const formData = new FormData();
            formData.append("content", editContent);
            if (editImages.length > 0) {
                editImages.forEach(image => {
                    formData.append("images", image);
                });
            }
            await updateThread(thread.id, formData);
            setIsEditing(false);
            setEditImages([]);
            dispatch(fetchThreads());
        } catch (error) {
            console.error("Failed to update thread", error);
        }
    };

    // Helper to render image grid
    const renderImageGrid = (images: string[]) => {
        if (!images || images.length === 0) return null;

        const count = images.length;
        const gridClass = count === 1 ? 'grid-cols-1' : count === 2 ? 'grid-cols-2' : 'grid-cols-2';

        return (
            <div className={`grid gap-1 mt-3 rounded-xl overflow-hidden ${gridClass}`} onClick={(e) => e.stopPropagation()}>
                {images.map((img, index) => (
                    <img
                        key={index}
                        src={img.startsWith("http") ? img : `http://localhost:5000${img}`}
                        alt={`Attachment ${index + 1}`}
                        className={`w-full object-cover border border-gray-800 ${count === 1 ? 'max-h-[500px]' : 'h-[200px]'
                            } ${count === 3 && index === 0 ? 'row-span-2 h-full' : ''}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <>
            <div
                onClick={() => navigate(`/thread/${thread.id}`)}
                className="flex space-x-4 p-4 border-b border-gray-800 hover:bg-white/5 transition-colors cursor-pointer relative"
            >
                <Avatar className="w-10 h-10 rounded-full">
                    <AvatarImage src={thread.user.profile_picture} className="object-cover" />
                    <AvatarFallback>{thread.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
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

                        {isAuthor && (
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMenuOpen(!isMenuOpen);
                                    }}
                                    className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-white/10"
                                >
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>

                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-32 bg-black border border-gray-800 rounded-lg shadow-lg z-50">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsEditing(true);
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2"
                                        >
                                            <Edit className="w-4 h-4" /> Edit
                                        </button>
                                        <button
                                            onClick={handleDeleteClick}
                                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-white/10 flex items-center gap-2"
                                        >
                                            <Trash className="w-4 h-4" /> Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-green-500"
                                rows={3}
                            />

                            {editPreviews.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {editPreviews.map((preview, index) => (
                                        <img key={index} src={preview} alt="Preview" className="rounded-lg border border-gray-800 h-[100px] w-full object-cover" />
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-2">
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
                                        className="text-green-500 hover:text-green-400 p-2"
                                        title="Change Images"
                                    >
                                        <ImageIcon className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleUpdate}
                                        className="px-3 py-1 bg-green-600 text-white rounded-full text-sm flex items-center gap-1 hover:bg-green-700"
                                    >
                                        <Check className="w-3 h-3" /> Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditImages([]);
                                            setEditPreviews(thread.images ? thread.images.map((img: string) => img.startsWith("http") ? img : `http://localhost:5000${img}`) : []);
                                        }}
                                        className="px-3 py-1 bg-gray-700 text-white rounded-full text-sm flex items-center gap-1 hover:bg-gray-600"
                                    >
                                        <X className="w-3 h-3" /> Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="mt-2 text-white/90 leading-relaxed font-light">
                                {thread.content}
                            </p>
                            {renderImageGrid(thread.images || (thread.image ? [thread.image] : []))}
                        </>
                    )}

                    <div className="flex items-center space-x-6 mt-4 text-gray-500">
                        <button
                            onClick={(e) => handleLike(e, thread.id)}
                            className={`flex items-center space-x-2 group ${thread.isLiked ? "text-red-500" : "hover:text-red-500"
                                }`}
                        >
                            <Heart className={`w-5 h-5 ${thread.isLiked ? "fill-current" : ""}`} />
                            <span className="text-sm">{thread.likes}</span>
                        </button>
                        {!hideReplyButton && (
                            <button className="flex items-center space-x-2 group hover:text-blue-500">
                                <MessageCircle className="w-5 h-5" />
                                <span className="text-sm">{thread.reply} Replies</span>
                            </button>
                        )}
                    </div>
                </div>

                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogContent className="sm:max-w-[425px] bg-black text-white border-gray-800">
                        <DialogHeader>
                            <DialogTitle>Delete Thread</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Are you sure you want to delete this thread? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDeleteOpen(false);
                                }}
                                className="bg-transparent border-gray-700 text-white hover:bg-white/10"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDelete();
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default ThreadCard;
