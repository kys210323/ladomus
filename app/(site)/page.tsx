"use client";

import { useEffect, useRef, useState } from "react";
import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/solid";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export default function SiteHome() {
  const playerRef = useRef<any>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    // IFrame API 로드 여부 확인
    if (!window.YT) {
      window.onYouTubeIframeAPIReady = () => {
        createPlayer();
      };
    } else {
      createPlayer();
    }
  }, []);

  const createPlayer = () => {
    playerRef.current = new window.YT.Player("myPlayer", {
      videoId: "F0H6dx18Wwc", // 원하는 영상 ID
      playerVars: {
        autoplay: 1,
        loop: 1,
        playlist: "F0H6dx18Wwc",
        controls: 0,
        showinfo: 0,
        disablekb: 1,
        modestbranding: 1,
        rel: 0
      },
      events: {
        onReady: (event: any) => {
          // 자동재생 허용 위해 음소거 시작
          event.target.mute();
        },
        onError: (err: any) => {
          console.error("YT Player Error", err);
        },
      },
    });
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (muted) {
      playerRef.current.unMute();
      setMuted(false);
    } else {
      playerRef.current.mute();
      setMuted(true);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 유튜브 배경 */}
      <div
        id="myPlayer"
        className="fixed top-0 left-0 w-full h-full object-cover z-[-1] bg-black"
      />

      {/* 소리 On/Off 버튼 (아이콘) */}
      <button
        onClick={toggleMute}
        className="absolute top-4 left-4 z-10 bg-white text-black rounded-full p-2"
        title={muted ? "소리 켜기" : "소리 끄기"}
      >
        {muted ? (
          <SpeakerXMarkIcon className="w-6 h-6" />
        ) : (
          <SpeakerWaveIcon className="w-6 h-6" />
        )}
      </button>

      {/* 테스트용 콘텐츠 */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <h1 className="text-white text-3xl font-bold">라 도무스 사이트 배경</h1>
      </div>
    </div>
  );
}
