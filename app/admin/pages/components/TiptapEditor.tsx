"use client";

import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// 추가
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";

interface TiptapEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
}

export default function TiptapEditor({
  initialContent = "<p>Hello Tiptap!</p>",
  onChange,
}: TiptapEditorProps) {
  // (1) Tiptap 에디터 생성
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle, // 폰트 관련 인라인 스타일
      Color.configure({
        types: ["textStyle"], // 어떤 노드/마크에 color 적용할지
      }),
    ],
    content: initialContent,

    /** (필수) SSR/Hydration Warning 완화 */
    immediatelyRender: false,

    // (선택) 업데이트 시 콜백
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  // (2) 툴바에서 색상·폰트 처리
  // 여기선 "폰트"도 인라인 스타일로 적용(=span style="font-family:...")
  function setColor(colorCode: string) {
    editor?.chain().focus().setColor(colorCode).run();
  }
  function setFontFamily(fontFamily: string) {
    // 커스텝 스타일
    editor?.chain().focus().setMark("textStyle", { fontFamily }).run();
  }

  if (!editor) {
    return <div>Loading Tiptap...</div>;
  }

  return (
    <div className="border p-2">
      {/* (A) 툴바 */}
      <div className="mb-2 flex gap-2">
        {/* 예시 색상 버튼 (베이지골드 포함) */}
        <button onClick={() => setColor("#9e896e")} className="px-2 py-1 border">
          베이지골드
        </button>
        <button onClick={() => setColor("red")} className="px-2 py-1 border">
          Red
        </button>

        {/* 폰트 변경 버튼들 (Times, Roboto, Arial) */}
        <button
          onClick={() => setFontFamily("Times New Roman")}
          className="px-2 py-1 border"
        >
          Times
        </button>
        <button
          onClick={() => setFontFamily("Roboto, sans-serif")}
          className="px-2 py-1 border"
        >
          Roboto
        </button>
        <button
          onClick={() => setFontFamily("Arial, sans-serif")}
          className="px-2 py-1 border"
        >
          Arial
        </button>
      </div>

      {/* (B) 에디터 영역 */}
      <EditorContent editor={editor} />
    </div>
  );
}
