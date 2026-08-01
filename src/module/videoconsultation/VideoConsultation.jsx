import { LiveKitRoom } from "@livekit/components-react";

import "@livekit/components-styles";

import { useEffect, useRef, useState } from "react";

import { ChevronRight, Send } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import ConsultationRoom from "./ConsultationRoom";
import { useNavigate, useParams } from "react-router-dom";

import {
  endConsultation,
  getLivekitToken,
  getMessages,
  saveMessage,
  getConsultation,
} from "../../services/livekitService";

const VideoConsultation = () => {
  const messageRef = useRef(null);

  const { user } = useAuth();

  const [token, setToken] = useState("");

  const [serverUrl, setServerUrl] = useState("");

  const [messages, setMessages] = useState([]);

  const [consultation, setConsultation] = useState(null);

  const [chatVisible, setChatVisible] = useState(true);

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { consultationId } = useParams();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    initializeConsultation();
  }, [consultationId, user]);

  // INITIALIZE CONSULTATION

const initializeConsultation = async () => {
  try {
    setLoading(true);

    // GET CONSULTATION

    const consultationData =
      await getConsultation(
        consultationId
      );

    const consultation =
      consultationData.consultation;

    setConsultation(
      consultation
    );

    console.log(
      "CONSULTATION",
      consultation
    );

    // GET LIVEKIT TOKEN

    const tokenData =
      await getLivekitToken({
        roomName:
          consultation.room_name,
      });

    console.log(
      "TOKEN DATA",
      tokenData
    );

    console.log(
      "SERVER URL",
      tokenData.url
    );

    setToken(
      tokenData.token
    );

    setServerUrl(
      tokenData.url
    );

    // LOAD MESSAGES

    const oldMessages =
      await getMessages(
        consultationId
      );

    setMessages(
      oldMessages.messages || []
    );
  } catch (error) {
    console.log(
      "VIDEO ERROR",
      error
    );

    console.log(
      error?.response?.data
    );
  } finally {
    setLoading(false);
  }
};

  // SEND MESSAGE

  const sendMessage = async () => {
    const text = messageRef.current?.value?.trim();

    if (!text) return;

    try {
      await saveMessage({
        consultationId: Number(consultationId),
        message: text,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender_user_id: user.id,
          message: text,
        },
      ]);

      messageRef.current.value = "";
    } catch (error) {
      console.log(error);
    }
  };

  // LEAVE CONSULTATION

  const leaveConsultation = async () => {
    try {
      if (consultationId) {
        await endConsultation(consultationId);
      }

      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  if (!user) {
    return null;
  }

  // LOADING

if (loading) {
  return (
    <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-lg font-semibold text-[#2563EB]">
        Loading consultation...
      </div>
    </div>
  );
}

if (!token) {
  return (
    <div className="h-screen flex items-center justify-center text-red-500">
      Token not received
    </div>
  );
}

if (!serverUrl) {
  return (
    <div className="h-screen flex items-center justify-center text-red-500">
      LiveKit URL missing
    </div>
  );
}

  return (
<LiveKitRoom
  token={token}
  serverUrl={serverUrl}
  connect={true}
  video={true}
  audio={true}
  className="h-screen"
  onConnected={() =>
    console.log("LIVEKIT CONNECTED")
  }
  onError={(err) =>
    console.log("LIVEKIT ERROR", err)
  }
>
      <div className="flex flex-col justify-between h-screen p-4 md:p-8 gap-4 bg-[#F8FAFC]">
        {/* HEADER */}

        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="https://i.pravatar.cc/150?img=12"
                alt="Doctor"
                className="w-10 h-10 rounded-full border-2 border-[#2563EB]"
              />

              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>

            <div>
              <p className="text-sm text-[#64748B]">Consultation in progress</p>

              <p className="font-semibold text-[#0F172A]">
                Room: {consultation?.room_name}
              </p>
            </div>
          </div>

          <button
            onClick={leaveConsultation}
            className="px-4 py-2 text-white bg-[#EF4444] hover:bg-[#DC2626] rounded-lg text-sm font-medium transition-colors"
          >
            Leave
          </button>
        </div>

        {/* BODY */}

        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* VIDEO */}

          <div
            className={`w-full h-full ${
              chatVisible ? "hidden md:block" : "block"
            }`}
          >
            <ConsultationRoom
              chatVisible={chatVisible}
              setChatVisible={setChatVisible}
            />
          </div>

          {/* CHAT */}

          <div
            className={`${
              chatVisible ? "flex" : "hidden"
            } p-4 gap-4 bg-[#EEF2FF] w-full md:w-[340px] flex-col rounded-xl h-full border border-[#E2E8F0]`}
          >
            <button
              onClick={() => setChatVisible(false)}
              className="self-end inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="flex flex-col gap-4 h-full min-h-0">
              {/* MESSAGES */}

              <div className="flex flex-col overflow-y-auto flex-1 p-2 gap-4">
                {messages.map((msg, index) => {
                  const isMine = msg.sender_user_id === user.id;

                  return (
                    <div
                      key={index}
                      className={`flex ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[220px] px-3 py-2 rounded-xl border ${
                          isMine
                            ? "bg-[#2563EB] text-white"
                            : "bg-white text-[#0F172A]"
                        }`}
                      >
                        <p className="text-sm break-words">{msg.message}</p>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              {/* INPUT */}

              <div className="flex items-center gap-2">
                <input
                  ref={messageRef}
                  type="text"
                  placeholder="Type a message..."
                  className="border border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#BFDBFE] text-[#0F172A] placeholder-[#94A3B8] text-sm px-3 py-2 rounded-lg w-full bg-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                />

                <button
                  onClick={sendMessage}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white p-3 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LiveKitRoom>
  );
};

export default VideoConsultation;
