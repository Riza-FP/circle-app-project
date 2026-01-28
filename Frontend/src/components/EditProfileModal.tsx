import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { updateProfileAsync } from "../features/auth/authSlice";
import { Loader2, Camera, X } from "lucide-react";
import { getAvatarUrl } from "../utils/imageUtils";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

const EditProfileModal = ({ isOpen, onClose, user }: EditProfileModalProps) => {
    const dispatch = useDispatch<any>();

    const [fullName, setFullName] = useState(user?.name || "");
    const [username, setUsername] = useState(user?.username || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);

    // Previews
    const [avatarPreview, setAvatarPreview] = useState(getAvatarUrl(user?.avatar));
    const [coverPreview, setCoverPreview] = useState(getAvatarUrl(user?.cover_photo));

    const [loading, setLoading] = useState(false);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("fullName", fullName);
            formData.append("username", username);
            formData.append("bio", bio);
            if (avatarFile) formData.append("avatar", avatarFile);
            if (coverFile) formData.append("cover", coverFile);

            // await updateProfile(formData); 
            // dispatch(authCheck()); 

            // Use the new Thunk to update store immediately
            await dispatch(updateProfileAsync(formData)).unwrap();

            toast.success("Profile updated successfully!");
            onClose();
        } catch (error) {
            console.error("Update failed:", error);
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-black text-white border-gray-800 p-0 overflow-hidden">
                <DialogHeader className="p-4 flex flex-row items-center justify-between border-b border-gray-800 bg-black z-10">
                    <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
                    <DialogDescription className="sr-only">Edit your profile details</DialogDescription>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-white/10 text-white">
                        <X className="w-5 h-5" />
                    </button>
                </DialogHeader>

                <div className="max-h-[80vh] overflow-y-auto px-4 pb-4">
                    {/* Cover Photo */}
                    <div className="relative w-full h-32 bg-gray-800 rounded-lg mt-4 overflow-hidden group">
                        {coverPreview ? (
                            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-700" />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => coverInputRef.current?.click()}
                                className="bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
                            >
                                <Camera className="w-6 h-6" />
                            </button>
                        </div>
                        <input
                            type="file"
                            ref={coverInputRef}
                            onChange={handleCoverChange}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>

                    {/* Avatar - overlapping cover */}
                    <div className="relative -mt-10 ml-4 w-20 h-20 rounded-full border-4 border-black group">
                        <Avatar className="w-full h-full">
                            <AvatarImage src={avatarPreview} className="object-cover" />
                            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => avatarInputRef.current?.click()}
                                className="bg-black/50 p-1.5 rounded-full text-white hover:bg-black/70"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <input
                            type="file"
                            ref={avatarInputRef}
                            onChange={handleAvatarChange}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-gray-400">Name</Label>
                            <Input
                                id="name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="bg-transparent border-gray-700 text-white focus:border-green-500"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="username" className="text-gray-400">Username</Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-transparent border-gray-700 text-white focus:border-green-500"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="bio" className="text-gray-400">Bio</Label>
                            <Textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="bg-transparent border-gray-700 text-white focus:border-green-500 min-h-[80px]"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-4 border-t border-gray-800 bg-black">
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditProfileModal;
