import React, { createContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store/store";
import { fetchThreads } from "../store/threadSlice";

interface WebSocketContextType {
    socket: WebSocket | null;
    successMessage: string | null;
    setSuccessMessage: (msg: string | null) => void;
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(
    undefined
);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const dispatch = useDispatch<any>();
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const user = useSelector((state: RootState) => state.auth.user);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:5000");

        ws.onopen = () => {
            console.log("Connected to WebSocket");
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);


                const token = localStorage.getItem("token");
                let currentUserId = user?.id || user?.user_id;

                if (!currentUserId && token) {
                    try {
                        const base64Url = token.split('.')[1];
                        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                        }).join(''));

                        const payload = JSON.parse(jsonPayload);
                        currentUserId = payload.user_id;
                    } catch (e) {
                        console.error("Failed to decode token", e);
                    }
                }

                if (data.type === "NOTIFICATION" && currentUserId === data.userId) {
                    // Placeholder: We will add a Notification Counter badge here later.
                    console.log("Notification:", data.message);
                }

                if (data.type === "NEW_THREAD") {
                    dispatch(fetchThreads());

                    if (data.data && data.data.authorId === currentUserId) {
                        setSuccessMessage("Your thread has been successfully posted!");
                        setTimeout(() => setSuccessMessage(null), 5000);
                    }
                }
            } catch (error) {
                console.error("Failed to parse websocket message", error);
            }
        };

        ws.onclose = () => {
            console.log("Disconnected from WebSocket");
        };

        setSocket(ws);

        return () => {
            ws.close();
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ socket, successMessage, setSuccessMessage }}>
            {children}
            {successMessage && (
                <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-8 py-4 rounded-full shadow-2xl z-[100] animate-in fade-in slide-in-from-bottom-5 font-bold text-lg flex items-center space-x-2">
                    <span>✅</span>
                    <span>{successMessage}</span>
                </div>
            )}
        </WebSocketContext.Provider>
    );
};
