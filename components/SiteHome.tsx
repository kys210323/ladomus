"use client";

import React, { useRef, useState, useEffect } from "react";
import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/solid";

export default function SiteHome() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [volume, setVolume] = useState(0);
  const [lastVolume, setLastVolume] = useState(0.5);

  // -----------------------------------
  // 1) 자동재생: muted + volume=0
  // -----------------------------------
  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.muted = true;
      v.volume = 0;
      v.play().catch((err) => {
        console.warn("자동재생 차단:", err);
      });
    }
  }, []);

  // -----------------------------------
  // 2) volume 변경 시 동영상에 반영
  // -----------------------------------
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = volume;
    v.muted = (volume === 0);
  }, [volume]);

  // 음소거 토글
  const toggleMute = () => {
    if (volume === 0) {
      setVolume(lastVolume || 0.5);
    } else {
      setVolume(0);
    }
  };

  // 볼륨 슬라이더 변경
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0) setLastVolume(val);
  };

  const isMuted = (volume === 0);

  return (
    <div className="w-full">
      {/**
       * 1) 모바일(기본)에서 mt-[77px] (혹은 64px 필요 시 조정),
       *    md:mt-0 → 데스크톱에서 margin-top=0
       */}
      <div className="relative w-full aspect-[16/9] overflow-hidden mt-[77px] md:mt-0">
        <video
          // (선택) key 속성 → 라우트 재진입 시 재생성
          key="videoKey"
          ref={videoRef}
          src="/videos/video1220.mp4"
          loop
          autoPlay
          playsInline
          className="
            absolute top-0 left-0
            w-full h-full
            object-cover
            pointer-events-none
          "
        />
        {/* 볼륨 UI */}
        <div className="absolute bottom-2 left-2 flex items-center bg-black/60 px-3 py-2 rounded z-10 pointer-events-auto">
          <button onClick={toggleMute} className="mr-2">
            {isMuted ? (
              <SpeakerXMarkIcon className="w-5 h-5 text-white" />
            ) : (
              <SpeakerWaveIcon className="w-5 h-5 text-white" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleChange}
            className="w-24 h-1 accent-white"
          />
        </div>
      </div>

      {/* 아래 컨텐츠 */}
      <div className="px-4 py-6">
        <h2 className="text-xl font-bold mb-3">영상 아래 컨텐츠</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          모바일에서 헤더 높이(77px)만큼 마진 탑을 줘서 영상이 안 겹치고,
          데스크톱에서는 mt-0.
        </p>
      </div>
    </div>
  );
}
