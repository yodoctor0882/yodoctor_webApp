
import { useState, useRef, useEffect } from "react";
import {
  FaComments,
  FaTimes,
  FaPaperPlane,
  FaMicrophone,
  FaGlobe,
} from "react-icons/fa";

import ReactMarkdown from "react-markdown";
import api from "../services/api";

const BOX_WIDTH = 360;
const BOX_HEIGHT = 520;

const formatTime = (time) =>
  new Date(time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const quickSuggestions = [
  "🤒 Fever",
  "🤧 Cold & Cough",
  "💊 Medicine",
  "🧠 Mental Health",
  "👶 Child Care",
];

const HealthcareChatbot = () => {
  const [open, setOpen] = useState(false);

  const [position, setPosition] = useState({
    x: window.innerWidth - BOX_WIDTH - 40,
    y: window.innerHeight - BOX_HEIGHT - 40,
  });

  const [language, setLanguage] = useState("auto");

  const dragging = useRef(false);

  const offset = useRef({ x: 0, y: 0 });

  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  const STORAGE_KEY = user?.id
    ? `chat_messages_${user.id}`
    : "chat_messages_guest";

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    return saved
      ? JSON.parse(saved)
      : [
          {
            id: Date.now(),
            role: "bot",
            text: `
# 👋 Welcome to YoDoctor AI

I can help you with:

✅ Symptoms  
✅ Medicines  
✅ Fitness  
✅ Diet  
✅ Mental Health  

How can I help you today?
            `,
            time: new Date().toISOString(),
          },
        ];
  });

  const [input, setInput] = useState("");

  const [isTyping, setIsTyping] = useState(false);

  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages),
    );
  }, [messages, STORAGE_KEY]);

  const onMouseDown = (e) => {
    dragging.current = true;

    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const onMouseMove = (e) => {
    if (!dragging.current) return;

    setPosition({
      x: Math.max(
        0,
        Math.min(
          e.clientX - offset.current.x,
          window.innerWidth - BOX_WIDTH,
        ),
      ),
      y: Math.max(
        0,
        Math.min(
          e.clientY - offset.current.y,
          window.innerHeight - BOX_HEIGHT,
        ),
      ),
    });
  };

  const onMouseUp = () => {
    dragging.current = false;
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);

    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener(
        "mousemove",
        onMouseMove,
      );

      window.removeEventListener(
        "mouseup",
        onMouseUp,
      );
    };
  });

  const clearChat = () => {
    localStorage.removeItem(STORAGE_KEY);

    setMessages([
      {
        id: Date.now(),
        role: "bot",
        text: `
# 👋 Welcome to YoDoctor AI

How can I help you today?
        `,
        time: new Date().toISOString(),
      },
    ]);
  };

  const sendMessage = async (
    customMessage,
  ) => {
    const question = customMessage || input;

    if (!question.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: question,
      time: new Date().toISOString(),
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setInput("");

    try {
      setIsTyping(true);

      const { data } = await api.post(
        "/api/chatbot",
        {
          message: question,
          language,
        },
      );

      setIsTyping(false);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "bot",
          text: data.reply,
          time: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      setIsTyping(false);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "bot",
          text: "❌ AI server error",
          time: new Date().toISOString(),
        },
      ]);
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input not supported");
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.start();

    setIsListening(true);

    recognition.onresult = (e) => {
      setInput(
        e.results[0][0].transcript,
      );

      setIsListening(false);
    };

    recognition.onerror = () =>
      setIsListening(false);

    recognition.onend = () =>
      setIsListening(false);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r bg-blue-700 text-white shadow-2xl flex items-center justify-center hover:scale-105 transition-all duration-300"
        >
          <FaComments size={24} />
        </button>
      )}

      {open && (
        <div
          style={
            window.innerWidth >= 768
              ? {
                  left: position.x,
                  top: position.y,
                }
              : {}
          }
          className="
            fixed z-50
            bg-white
            rounded-3xl
            shadow-2xl
            overflow-hidden
            flex flex-col
            border border-gray-200
            w-[95vw]
            max-w-[360px]
            h-[85vh]
            max-h-[520px]
            left-1/2
            -translate-x-1/2
            bottom-4
            md:left-auto
            md:bottom-auto
            md:translate-x-0
          "
        >
          {/* HEADER */}

          <div
            onMouseDown={onMouseDown}
            className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-4 cursor-move"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg">
                  🩺 YoDoctor AI
                </h2>

                <p className="text-xs opacity-90">
                  24x7 Healthcare Assistant
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={clearChat}
                  className="border border-white/40 px-2 py-1 rounded text-xs hover:bg-white/20 transition"
                >
                  Clear
                </button>

                <button
                  onClick={() =>
                    setOpen(false)
                  }
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* LANGUAGE */}

            <div className="mt-3 flex items-center gap-2 bg-white/20 w-30 rounded-xl px-3 py-2">
              <FaGlobe />

              <select
                value={language}
                onChange={(e) =>
                  setLanguage(
                    e.target.value,
                  )
                }
                className="bg-transparent text-white outline-none text-sm"
              >
                <option
                  value="auto"
                  className="text-black"
                >
                  Auto
                </option>

                <option
                  value="english"
                  className="text-black"
                >
                  English
                </option>

                <option
                  value="hindi"
                  className="text-black"
                >
                  Hindi
                </option>

                <option
                  value="hinglish"
                  className="text-black"
                >
                  Hinglish
                </option>

                <option
                  value="gujarati"
                  className="text-black"
                >
                  Gujarati
                </option>
              </select>
            </div>
          </div>

          {/* QUICK BUTTONS */}

          <div className="px-3 py-2 flex gap-2 overflow-x-auto bg-gray-50">
            {quickSuggestions.map(
              (item) => (
                <button
                  key={item}
                  onClick={() =>
                    sendMessage(item)
                  }
                  className="whitespace-nowrap bg-white border border-emerald-200 hover:bg-emerald-50 text-sm px-3 py-1 rounded-full transition"
                >
                  {item}
                </button>
              ),
            )}
          </div>

          {/* CHAT AREA */}

          <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#f7fafc] space-y-4 min-h-0">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm break-words ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-br-sm"
                      : "bg-white text-gray-800 rounded-bl-sm"
                  }`}
                >
                  <ReactMarkdown>
                    {msg.text}
                  </ReactMarkdown>

                  <div
                    className={`text-[10px] mt-2 ${
                      msg.role === "user"
                        ? "text-emerald-100"
                        : "text-gray-400"
                    }`}
                  >
                    {formatTime(msg.time)}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>

                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100"></span>

                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-200"></span>
                </div>

                YoDoctor is typing...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}

          <div className="p-3 border-t bg-white">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) =>
                  setInput(e.target.value)
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  sendMessage()
                }
                placeholder="Ask your health question..."
                className="flex-1 border border-gray-300 rounded-2xl px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />

              <button
                onClick={startListening}
                className={`w-11 h-11 rounded-full flex items-center justify-center ${
                  isListening
                    ? "bg-red-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                <FaMicrophone />
              </button>

              <button
                onClick={() =>
                  sendMessage()
                }
                disabled={!input.trim()}
                className="w-11 h-11 rounded-full bg-gradient-to-r from-blue-700 to-blue-500 text-white flex items-center justify-center disabled:opacity-50"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HealthcareChatbot;