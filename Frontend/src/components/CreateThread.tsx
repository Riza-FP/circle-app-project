import { useState } from "react";
import { createThread } from "../services/threadApi";
import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CreateThread = ({ refresh }: any) => {
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const user = useSelector((state: RootState) => state.auth.user);

    const handleSubmit = async () => {
        if (!content.trim() || isLoading) return;

        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            await createThread(content);
            setContent("");
            refresh();
        } catch (error) {
            console.error("Failed to create thread", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex space-x-4 p-4 border-b border-gray-800">
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
                <div className="flex justify-between items-center border-t border-gray-800 pt-4">
                    <button className="text-green-500 hover:text-green-400">
                        <Image className="w-6 h-6" />
                    </button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 font-bold"
                        disabled={!content.trim() || isLoading}
                    >
                        {isLoading ? "Posting..." : "Post"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateThread;
