import { useEffect, useRef, useState } from "react";

import ControlsBar from "./ControlsBar";
import VideoRenderer from "./VideoRenderer";

const ConsultationRoom = ({ chatVisible, setChatVisible }) => {
  const [controlsVisible, setControlsVisible] = useState(true);

  const timeoutRef = useRef(null);

  const hideControls = () => {
    setControlsVisible(false);
  };

  const showControls = () => {
    setControlsVisible(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      hideControls();
    }, 3000);
  };

  useEffect(() => {
    showControls();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative h-full w-full bg-black rounded-2xl overflow-hidden flex items-center justify-center"
      onMouseMove={showControls}
      onMouseEnter={showControls}
      onClick={showControls}
    >
      {/* VIDEO AREA */}

      <div className="absolute inset-0">
        <VideoRenderer />
      </div>

      {/* GRADIENT OVERLAY */}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      {/* CONTROLS */}

      <div
        className={`absolute top-4 right-4 z-50 transition-all duration-300 ${
          controlsVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <ControlsBar
          chatVisible={chatVisible}
          setChatVisible={setChatVisible}
          show={controlsVisible}
        />
      </div>
    </div>
  );
};

export default ConsultationRoom;
