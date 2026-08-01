import { MessageCircle, MessageCircleOff } from "lucide-react";
import AudioDevice from "./AudioDevice";
import VideoDevice from "./VideoDevice";

const ControlsBar = ({ show, chatVisible, setChatVisible }) => {
  return (
    <div
      className={`absolute top-4 right-4 flex bg-white/95 backdrop-blur-sm p-2 gap-2 rounded-xl border border-[#E2E8F0] shadow-sm transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <AudioDevice />
      <VideoDevice />
      <button
        onClick={() => setChatVisible((p) => !p)}
        className="border border-[#E2E8F0] px-4 py-2 rounded-lg hover:bg-[#EEF2FF] text-[#0F172A] hover:text-[#2563EB] transition-colors"
      >
        {chatVisible
          ? <MessageCircle className="w-5 h-5" />
          : <MessageCircleOff className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default ControlsBar;