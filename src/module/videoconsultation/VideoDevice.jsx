import { useState } from "react";

import { ChevronDown, ChevronUp, Video, VideoOff } from "lucide-react";

import {
  useLocalParticipant,
  useMediaDeviceSelect,
} from "@livekit/components-react";

const VideoDevice = () => {
  const [isOpen, setIsOpen] = useState(false);

  // LIVEKIT LOCAL USER

  const { isCameraEnabled, localParticipant } = useLocalParticipant();

  // CAMERA DEVICES

  const { devices, activeDeviceId, setActiveMediaDevice } =
    useMediaDeviceSelect({
      kind: "videoinput",
    });

  // TOGGLE CAMERA

  const toggleCamera = async () => {
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    } catch (error) {
      console.log(error);
    }
  };

  // CHANGE CAMERA DEVICE

  const changeDevice = async (deviceId) => {
    try {
      await setActiveMediaDevice("videoinput", deviceId);

      setIsOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="inline-flex rounded-lg border border-[#E2E8F0] bg-white overflow-visible">
      {/* CAMERA BUTTON */}

      <button
        onClick={toggleCamera}
        className="px-4 py-2 border-r border-[#E2E8F0] hover:bg-[#EEF2FF] text-[#0F172A] hover:text-[#2563EB] transition-colors"
      >
        {isCameraEnabled ? (
          <Video className="w-5 h-5" />
        ) : (
          <VideoOff className="w-5 h-5 text-[#EF4444]" />
        )}
      </button>

      {/* DEVICE SELECT */}

      <div className="relative">
        <button
          className="px-3 py-2 hover:bg-[#EEF2FF] text-[#64748B] hover:text-[#2563EB] transition-colors"
          onClick={() => setIsOpen((p) => !p)}
        >
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {isOpen && (
          <div className="absolute top-12 right-0 bg-white shadow-lg border border-[#E2E8F0] rounded-lg overflow-hidden z-50 min-w-[220px]">
            {devices.map((device) => (
              <div
                key={device.deviceId}
                onClick={() => changeDevice(device.deviceId)}
                className={`px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                  device.deviceId === activeDeviceId
                    ? "bg-[#DBEAFE] text-[#1D4ED8] font-medium"
                    : "text-[#0F172A] hover:bg-[#EEF2FF] hover:text-[#2563EB]"
                }`}
              >
                {device.label || "Camera"}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDevice;
