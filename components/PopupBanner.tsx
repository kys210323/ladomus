"use client";

import React, { useState, useEffect } from "react";

export default function PopupBanner() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // 예: localStorage 에 'popupHideToday' 키가 있으면 열지 않음
    const hideToday = localStorage.getItem("popupHideToday");
    if (hideToday === "true") {
      setIsOpen(false);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleHideToday = () => {
    // "오늘 하루 열지 않음" 클릭 시 localStorage 기록 후 팝업 닫기
    localStorage.setItem("popupHideToday", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* 팝업 콘텐츠 상자 */}
      <div className="bg-white max-w-md w-full p-4 relative rounded shadow">
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-1 bg-gray-200 rounded"
        >
          닫기
        </button>

        {/* 배너 이미지 (또는 DIV) */}
        <img
          src="/images/popup-banner.jpg"
          alt="팝업배너"
          className="w-full mb-3"
        />

        {/* "오늘 하루 열지 않기" 버튼 */}
        <button
          onClick={handleHideToday}
          className="bg-gray-300 px-3 py-1 rounded text-sm"
        >
          오늘 하루 이 창을 열지 않음
        </button>
      </div>
    </div>
  );
}
