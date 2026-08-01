import { useTracks, VideoTrack } from "@livekit/components-react";

import { Track } from "livekit-client";

import { CameraOff } from "lucide-react";

import { useMemo, useState } from "react";

const VideoRenderer = () => {
  const [fullscreenTrackIndex, setFullscreenTrackIndex] = useState(0);

  // LIVEKIT CAMERA TRACKS

  const tracks = useTracks([
    {
      source: Track.Source.Camera,
      withPlaceholder: true,
    },
  ]);

  // FILTER VALID TRACKS

  const videos = useMemo(
    () => tracks.filter((track) => track.publication),
    [tracks],
  );

  // MAIN VIDEO

  const fullscreenVideo = videos[fullscreenTrackIndex];

  // MINI VIDEO

  const minimizedVideo = videos[fullscreenTrackIndex === 1 ? 0 : 1];

  return (
    <div className="h-full w-full flex justify-center items-center relative bg-black overflow-hidden rounded-2xl">
      {/* FULLSCREEN VIDEO */}

      {fullscreenVideo ? (
        <VideoTrack
          trackRef={fullscreenVideo}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-white bg-[#0F172A]">
          <CameraOff className="w-14 h-14 opacity-80" />

          <p className="mt-3 text-sm opacity-80">Camera is off</p>
        </div>
      )}

      {/* MINI VIDEO */}

      {minimizedVideo && (
        <div
          className="absolute ml-8 mt-8 right-8 bottom-8 w-20 h-20 sm:w-32 sm:h-32 rounded-xl overflow-hidden cursor-pointer flex bg-[#0F172A] justify-center items-center border-2 border-white shadow-2xl hover:scale-105 transition-transform duration-200"
          onClick={() =>
            setFullscreenTrackIndex((prev) => (prev === 1 ? 0 : 1))
          }
        >
          <VideoTrack
            trackRef={minimizedVideo}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default VideoRenderer;
