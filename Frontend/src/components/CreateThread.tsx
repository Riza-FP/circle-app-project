import { useState, useRef, useEffect } from "react";
import { createThread } from "../services/threadApi";
import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useContext } from "react";
import { WebSocketContext } from "../contexts/WebSocketContext";

const CreateThread = ({ children }: { children: React.ReactNode }) => {
    const [content, setContent] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const user = useSelector((state: RootState) => state.auth.user);
    const { successMessage } = useContext(WebSocketContext)!;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Watch for WebSocket confirmation to close dialog
    useEffect(() => {
        if (successMessage) {
            setIsOpen(false);
            setIsLoading(false);

            // Reset form
            setContent("");
            setImages([]);
            setPreviews([]);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }, [successMessage]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = Array.from(files);
            if (newFiles.length + images.length > 4) {
                alert("You can only upload up to 4 images.");
                return;
            }

            setImages((prev) => [...prev, ...newFiles]);

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews((prev) => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if ((!content.trim() && images.length === 0) || isLoading) return;

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("content", content);
            images.forEach((image) => {
                formData.append("images", image);
            });

            await new Promise((resolve) => setTimeout(resolve, 1500));
            await createThread(formData);

            // Wait for WebSocket to close dialog via useEffect

        } catch (error) {
            console.error("Failed to create thread", error);
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-black text-white border-gray-800">
                <div className="flex space-x-4 p-4">
                    <Avatar>
                        <AvatarImage src={user?.avatar} className="object-cover" />
                        <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-4">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What is happening?!"
                            className="w-full bg-transparent text-xl placeholder-gray-500 border-none outline-none resize-none min-h-[50px] text-white"
                        />

                        {previews.length > 0 && (
                            <div className={`grid gap-2 ${previews.length === 1 ? 'grid-cols-1' :
                                    previews.length === 2 ? 'grid-cols-2' :
                                        'grid-cols-2'
                                }`}>
                                {previews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index}`}
                                            className={`rounded-xl object-cover w-full ${previews.length === 1 ? 'max-h-[300px]' : 'h-[150px]'}`}
                                        />
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between items-center border-t border-gray-800 pt-4">
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
                                className="text-green-500 hover:text-green-400"
                            >
                                <Image className="w-6 h-6" />
                            </button>
                            <Button
                                onClick={handleSubmit}
                                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 font-bold"
                                disabled={(!content.trim() && images.length === 0) || isLoading}
                            >
                                {isLoading ? "Posting..." : "Post"}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateThread;
