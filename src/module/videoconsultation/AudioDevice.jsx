import { useState } from "react";

import { ChevronDown, ChevronUp, Mic, MicOff } from "lucide-react";

import {
  useLocalParticipant,
  useMediaDeviceSelect,
} from "@livekit/components-react";

const AudioDevice = () => {
  const [isOpen, setIsOpen] = useState(false);

  // LIVEKIT LOCAL PARTICIPANT

  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();

  // MICROPHONE DEVICES

  const { devices, activeDeviceId, setActiveMediaDevice } =
    useMediaDeviceSelect({
      kind: "audioinput",
    });

  // TOGGLE MIC

  const toggleMic = async () => {
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch (error) {
      console.log(error);
    }
  };

  // CHANGE DEVICE

  const changeDevice = async (deviceId) => {
    try {
      await setActiveMediaDevice("audioinput", deviceId);

      setIsOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="inline-flex rounded-lg border border-[#E2E8F0] bg-white overflow-visible">
      {/* MIC BUTTON */}

      <button
        onClick={toggleMic}
        className="px-4 py-2 border-r border-[#E2E8F0] hover:bg-[#EEF2FF] text-[#0F172A] hover:text-[#2563EB] transition-colors"
      >
        {isMicrophoneEnabled ? (
          <Mic className="w-5 h-5" />
        ) : (
          <MicOff className="w-5 h-5 text-[#EF4444]" />
        )}
      </button>

      {/* DEVICE DROPDOWN */}

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
                {device.label || "Microphone"}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioDevice;