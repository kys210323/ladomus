"use client";

import React, { useState } from "react";
import type { IPage } from "../page";

interface Props {
  parents: IPage[];
  loadParents: () => void;
}

/** 타입을 확장: "page" | "board" | "hidden" */
type PageType = "page" | "board" | "hidden";

export default function CreatePageForm({ parents, loadParents }: Props) {
  const [parentId, setParentId] = useState<number>(0);

  // (★) 기존 "page"|"board"에 "hidden" 추가
  const [type, setType] = useState<PageType>("page");

  const [template, setTemplate] = useState("default"); 
  const [title, setTitle] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [slug, setSlug] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    let raw = slug.trim().toLowerCase();
    if (!raw.startsWith("/")) {
      raw = "/" + raw;
    }

    // POST /admin/pages/api
    const body = {
      parentId: parentId === 0 ? null : parentId,
      type,               // ← "page"|"board"|"hidden"
      template,
      title,
      seo_title: seoTitle,
      seo_description: seoDescription,
      slug: raw
    };

    const res = await fetch("/admin/pages/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      // 폼 초기화
      setParentId(0);
      setType("page");
      setTemplate("default");
      setTitle("");
      setSeoTitle("");
      setSeoDescription("");
      setSlug("");
      loadParents();
    }
  }

  return (
    <div className="bg-white border border-gray-200 p-4 rounded shadow">
      <h2 className="text-md font-semibold mb-3">새 페이지 생성</h2>
      <form onSubmit={handleCreate} className="space-y-2">
        {/* 부모 선택 */}
        <div>
          <label className="block text-xs mb-1">부모 선택 (0=루트)</label>
          <select
            className="border border-gray-300 p-1 text-xs w-full"
            value={parentId}
            onChange={(e) => setParentId(Number(e.target.value))}
          >
            <option value={0}>-- 루트 --</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.slug})
              </option>
            ))}
          </select>
        </div>

        {/* 타입 */}
        <div>
          <label className="block text-xs mb-1">타입</label>
          <select
            className="border border-gray-300 p-1 text-xs w-full"
            value={type}
            onChange={(e) => setType(e.target.value as PageType)}
          >
            <option value="page">페이지</option>
            <option value="board">게시판</option>
            <option value="hidden">히든(메뉴 노출 X)</option>
          </select>
        </div>

        {/* 템플릿 */}
        <div>
          <label className="block text-xs mb-1">템플릿</label>
          <select
            className="border border-gray-300 p-1 text-xs w-full"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          >
            <option value="default">Default 템플릿</option>
            <option value="landing">Landing 템플릿</option>
            <option value="board">Board 템플릿</option>
          </select>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-xs mb-1">제목</label>
          <input
            className="border border-gray-300 p-1 text-xs w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* SEO Title */}
        <div>
          <label className="block text-xs mb-1">SEO Title</label>
          <input
            className="border border-gray-300 p-1 text-xs w-full"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
          />
        </div>

        {/* SEO Description */}
        <div>
          <label className="block text-xs mb-1">SEO Description</label>
          <textarea
            className="border border-gray-300 p-1 text-xs w-full"
            rows={2}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
          />
        </div>

        {/* 슬러그 */}
        <div>
          <label className="block text-xs mb-1">슬러그</label>
          <input
            className="border border-gray-300 p-1 text-xs w-full"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
        >
          생성
        </button>
      </form>
    </div>
  );
}
