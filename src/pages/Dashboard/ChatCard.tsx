import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { VscSend } from "react-icons/vsc";
import { chatService } from "../../services/AuthServices";
import "./chat.css";

type ChatMsg = {
    role: "user" | "bot";
    text: string;
};

const ChatCard = () => {
    const [message, setMessage] = useState("");
    const [chatList, setChatList] = useState<ChatMsg[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSendMessage = async () => {
        console.log("okkkk");

        if (!message.trim() || loading) return;
        console.log("niche...");
        setChatList((prev) => [...prev, { role: "user", text: message }]);
        setMessage("");

        try {
            setLoading(true);
            const res = await chatService({ message });

            setChatList((prev) => [
                ...prev,
                { role: "bot", text: res?.data?.botReply || "No response" },
            ]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage();
    };

    return (
        <div className="card">
            <h5 className="card-header">Chat with AI</h5>

            {/* Chat Body */}
            <div className="card-body chat-body">
                {chatList.map((msg, index) => (
                    <div
                        key={index}
                        className={`chat-row ${msg.role === "user" ? "user" : "bot"}`}
                    >
                        <div
                            key={index}
                            className={`chat-row ${msg.role === "user" ? "user" : "bot"}`}
                        >
                            <div className="chat-bubble">
                                {msg.role === "bot" ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.text}
                                    </ReactMarkdown>
                                ) : (
                                    msg.text
                                )}
                            </div>
                        </div>

                    </div>
                ))}

                {loading && <p className="text-muted">AI is typing...</p>}
            </div>

            {/* Input */}
            <form className="card-footer" onSubmit={handleSubmit}>
                <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Ask something..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                />

                <button
                    type="submit"
                    className="btn btn-info float-end mt-2"
                    disabled={loading || !message.trim()}
                >
                    <VscSend className="text-light" />
                </button>
            </form>
        </div>
    );
};

export default ChatCard;
