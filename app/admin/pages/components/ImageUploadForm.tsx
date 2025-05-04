"use client";

import React, { useRef, useState } from "react";

interface ImageUploadFormProps {
  // 여러 파일이 업로드될 수 있으므로, 콜백도 배열 형태로 받을 수 있음.
  onUploaded?: (imageUrls: string[]) => void;
}

/**
 * 여러 파일 동시 업로드: 
 * 1) '파일 선택' 클릭 → <input type="file" multiple> 열기
 * 2) 여러 파일 담은 state
 * 3) '업로드' 클릭 시 각각 formData.append("file", file) → 서버로 전송
 * 4) 서버는 urls 배열로 응답
 */
export default function ImageUploadForm({ onUploaded }: ImageUploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  /** 1) '파일 선택' 버튼 → 실제 input[type="file"] 트리거 */
  function handleSelectFile() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  /** 2) 파일 선택 시 state 저장(여러 파일) */
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) {
      setFiles([]);
      return;
    }
    // FileList를 배열로 변환
    const selected = Array.from(e.target.files);
    setFiles(selected);
  }

  /** 3) 업로드 로직 */
  async function handleUploadClick() {
    if (files.length === 0) {
      alert("파일을 선택하세요.");
      return;
    }
    setUploading(true);

    try {
      // FormData에 모든 파일 append
      const formData = new FormData();
      for (const file of files) {
        formData.append("file", file);
      }

      // 실제 업로드 엔드포인트(/admin/api/upload 등) 교체 가능
      const res = await fetch("/admin/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`업로드 실패: ${res.status} ${res.statusText}`);
      }

      // 서버가 { urls: [] } 형태로 응답한다고 가정
      const data = await res.json();
      if (onUploaded && data.urls) {
        onUploaded(data.urls);
      }

      // 초기화
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("이미지 업로드 오류:", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {/* 숨긴 파일 입력: multiple 속성 추가 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 파일 선택 버튼 */}
      <button
        type="button"
        onClick={handleSelectFile}
        className="bg-gray-200 border border-gray-400 px-3 py-1 text-sm rounded hover:bg-gray-300"
        style={{ marginRight: 8 }}
      >
        파일 선택
      </button>

      {/* 파일 목록 표시 */}
      {files.length > 0 ? (
        <span className="text-sm text-gray-700">
          {files.map((f) => f.name).join(", ")}
        </span>
      ) : (
        <span className="text-sm text-gray-400">선택된 파일 없음</span>
      )}

      {/* 업로드 버튼 */}
      <button
        onClick={handleUploadClick}
        disabled={files.length === 0 || uploading}
        className="ml-2 bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600"
      >
        {uploading ? "업로드 중..." : "업로드"}
      </button>
    </div>
  );
}
