import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BsFillSendFill } from "react-icons/bs";
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

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);

  // 🔥 Auto grow textarea
  const handleTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setMessage(e.target.value);

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  };

  // 🔥 Auto scroll to bottom
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop =
        chatBodyRef.current.scrollHeight;
    }
  }, [chatList, loading]);

  const handleSendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message;

    setChatList((prev) => [...prev, { role: "user", text: userMessage }]);
    setMessage("");

    // reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }

    try {
      setLoading(true);
      const res = await chatService({ message: userMessage });

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
    <div className="card chat-card">
      <h5 className="card-header">Chat with AI</h5>

      <div className="chat-container">
        {/* Chat Messages */}
        <div className="chat-body" ref={chatBodyRef}>
          {chatList.map((msg, index) => (
            <div
              key={index}
              className={`chat-row ${
                msg.role === "user" ? "user" : "bot"
              }`}
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
          ))}

          {loading && <p className="typing">AI is typing...</p>}
        </div>

        {/* Input */}
        <form className="chat-footer" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            className="form-control"
            placeholder="Ask something..."
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />

          <button
            type="submit"
            className="sendbutton"
            disabled={loading || !message.trim()}
          >
            <BsFillSendFill />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatCard;
