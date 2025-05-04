"use client";

import React, { useState } from "react";
import {
  DragDropContext as DndContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import type { IPage } from "../page";

/** onEditWidgets 콜백: (pageId, pageTitle) => void */
interface Props {
  parents: IPage[];
  setParents: React.Dispatch<React.SetStateAction<IPage[]>>;
  isSorting: boolean;
  isManaging: boolean;
  loadParents: () => void;
  onEditWidgets?: (pageId: number, pageTitle: string) => void;
}

export default function PageList({
  parents,
  setParents,
  isSorting,
  isManaging,
  loadParents,
  onEditWidgets,
}: Props) {
  /* ----------------------------- state ----------------------------- */
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [editPageId, setEditPageId] = useState<number | null>(null);
  const [editType, setEditType] = useState<"page" | "board" | "hidden">("page");
  const [editTemplate, setEditTemplate] = useState("default");
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editSeoTitle, setEditSeoTitle] = useState("");
  const [editSeoDescription, setEditSeoDescription] = useState("");

  /* ---------------------------- filters ---------------------------- */
  const visibleParents = parents.filter((p) => p.type !== "hidden");
  const hiddenParents  = parents.filter((p) => p.type === "hidden");

  /** visibleParents 인덱스를 원본 parents 인덱스로 변환 */
  const mapVisibleIdx = (i: number) =>
    parents.findIndex((p) => p.id === visibleParents[i].id);

  const toggleExpand = (id: number) =>
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  /* --------------------------- DnD: 부모 --------------------------- */
  async function onDragEndParents(result: DropResult) {
    if (!result.destination || result.source.index === result.destination.index) return;

    const src = mapVisibleIdx(result.source.index);
    const dst = mapVisibleIdx(result.destination.index);

    const arr = [...parents];
    const [moved] = arr.splice(src, 1);
    arr.splice(dst, 0, moved);
    arr.forEach((p, i) => (p.sortOrder = i));
    setParents(arr);

    await fetch("/admin/pages/api/hierarchy/parentsort", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(arr.map((p) => ({ id: p.id, sortOrder: p.sortOrder ?? 0 }))),
    });
  }

  /* --------------------------- DnD: 자식 --------------------------- */
  async function onDragEndChildren(parentId: number, result: DropResult) {
    if (!result.destination || result.source.index === result.destination.index) return;

    const pIdx = parents.findIndex((p) => p.id === parentId);
    if (pIdx < 0 || !parents[pIdx].children) return;

    const arr = [...parents[pIdx].children!];
    const [moved] = arr.splice(result.source.index, 1);
    arr.splice(result.destination.index, 0, moved);
    arr.forEach((c, i) => (c.sortOrder = i));

    const newParents = [...parents];
    newParents[pIdx] = { ...parents[pIdx], children: arr };
    setParents(newParents);

    await fetch("/admin/pages/api/hierarchy/childsort", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parentId,
        children: arr.map((c) => ({ id: c.id, sortOrder: c.sortOrder ?? 0 })),
      }),
    });
  }

  /* --------------------------- CRUD helpers --------------------------- */
  function startEditPage(page: IPage) {
    setEditPageId(page.id);
    setEditType(page.type);
    setEditTemplate(page.template ?? "default");
    setEditTitle(page.title);
    setEditSlug(page.slug);
    setEditSeoTitle(page.seo_title ?? "");
    setEditSeoDescription(page.seo_description ?? "");
  }
  const cancelEditPage = () => setEditPageId(null);

  async function saveEditPage(e: React.FormEvent) {
    e.preventDefault();
    if (!editPageId) return;

    let rawSlug = editSlug.trim().toLowerCase();
    if (!rawSlug.startsWith("/")) rawSlug = "/" + rawSlug;

    const body = {
      id: editPageId,
      type: editType,
      template: editTemplate,
      title: editTitle,
      slug: rawSlug,
      seo_title: editSeoTitle,
      seo_description: editSeoDescription,
    };

    const res = await fetch("/admin/pages/api", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setEditPageId(null);
      loadParents();
    }
  }

  async function handleDeletePage(pageId: number) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const res = await fetch(`/admin/pages/api?id=${pageId}`, { method: "DELETE" });
    if (res.ok) loadParents();
  }

  /* ------------------------ renderParents ------------------------ */
  function renderParents(list: IPage[]) {
    return (
      <DndContext onDragEnd={onDragEndParents}>
        <Droppable droppableId="parents">
          {(provided) => (
            <ul
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="divide-y divide-gray-200"
            >
              {list.map((parent, visIdx) => (
                <Draggable
                  key={parent.id}
                  draggableId={`parent-${parent.id}`}
                  index={visIdx}
                  isDragDisabled={!isSorting}
                >
                  {(prov) => (
                    <li
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      {...prov.dragHandleProps}
                      className="py-2"
                    >
                      {/* ========== 부모: 인라인 편집 ========== */}
                      {editPageId === parent.id ? (
                        <form onSubmit={saveEditPage} className="space-y-1 text-xs">
                          <select
                            className="border border-gray-300 p-1 text-xs w-full"
                            value={editType}
                            onChange={(e) =>
                              setEditType(e.target.value as "page" | "board" | "hidden")
                            }
                          >
                            <option value="page">페이지</option>
                            <option value="board">게시판</option>
                            <option value="hidden">숨김</option>
                          </select>
                          <select
                            className="border border-gray-300 p-1 text-xs w-full"
                            value={editTemplate}
                            onChange={(e) => setEditTemplate(e.target.value)}
                          >
                            <option value="default">Default 템플릿</option>
                            <option value="landing">Landing 템플릿</option>
                            <option value="board">Board 템플릿</option>
                            <option value="child">Child 템플릿</option>
                          </select>
                          <input
                            className="border border-gray-300 p-1 text-xs w-full"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            required
                            placeholder="페이지 제목"
                          />
                          <input
                            className="border border-gray-300 p-1 text-xs w-full"
                            value={editSlug}
                            onChange={(e) => setEditSlug(e.target.value)}
                            required
                            placeholder="/slug"
                          />
                          <input
                            className="border border-gray-300 p-1 text-xs w-full"
                            value={editSeoTitle}
                            onChange={(e) => setEditSeoTitle(e.target.value)}
                            placeholder="SEO Title"
                          />
                          <textarea
                            className="border border-gray-300 p-1 text-xs w-full"
                            rows={2}
                            value={editSeoDescription}
                            onChange={(e) => setEditSeoDescription(e.target.value)}
                            placeholder="SEO Description"
                          />
                          <div className="space-x-2 mt-1">
                            <button
                              type="submit"
                              className="bg-blue-500 text-white px-3 py-1 text-xs rounded hover:bg-blue-600"
                            >
                              저장
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditPage}
                              className="text-xs text-gray-400 underline"
                            >
                              취소
                            </button>
                          </div>
                        </form>
                      ) : (
                        /* ========== 부모: 일반 표시 ========== */
                        <div className="flex items-center justify-between">
                          <div>
                            <strong>{parent.title}</strong>{" "}
                            <span className="text-gray-400">({parent.slug})</span>
                            <span className="text-blue-600 ml-1">[{parent.type}]</span>
                            {parent.template && (
                              <span className="text-green-600 ml-1">
                                (템플릿: {parent.template})
                              </span>
                            )}
                            {parent.children?.length ? (
                              <button
                                onClick={() => toggleExpand(parent.id)}
                                className="ml-2 text-xs underline text-gray-500"
                              >
                                {expandedIds.includes(parent.id)
                                  ? "접기"
                                  : `+(${parent.children.length})`}
                              </button>
                            ) : null}
                          </div>

                          {!isManaging ? (
                            <a
                              href={parent.slug}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                            >
                              바로가기
                            </a>
                          ) : (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => startEditPage(parent)}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
                              >
                                편집
                              </button>
                              <button
                                onClick={() => handleDeletePage(parent.id)}
                                className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                              >
                                삭제
                              </button>
                              {onEditWidgets && (
                                <button
                                  onClick={() =>
                                    onEditWidgets(
                                      parent.id,
                                      parent.seo_title || parent.title,
                                    )
                                  }
                                  className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
                                >
                                  위젯 편집
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ========== 자식 목록 ========== */}
                      {expandedIds.includes(parent.id) && parent.children && (
                        <div className="ml-6 mt-2 border-l pl-2">
                          <DndContext
                            onDragEnd={(r) => onDragEndChildren(parent.id, r)}
                          >
                            <Droppable droppableId={`child-${parent.id}`}>
                              {(childProv) => (
                                <ul
                                  ref={childProv.innerRef}
                                  {...childProv.droppableProps}
                                  className="divide-y divide-gray-200"
                                >
                                  {(parent.children ?? []).map((child, cIdx) => (
                                    <Draggable
                                      key={child.id}
                                      draggableId={`child-${child.id}`}
                                      index={cIdx}
                                      isDragDisabled={!isSorting}
                                    >
                                      {(cprov) => (
                                        <li
                                          ref={cprov.innerRef}
                                          {...cprov.draggableProps}
                                          {...cprov.dragHandleProps}
                                          className="py-1 flex justify-between text-sm"
                                        >
                                          {editPageId === child.id ? (
                                            /* ---- 자식 인라인 편집 ---- */
                                            <form
                                              onSubmit={saveEditPage}
                                              className="space-y-1 text-xs w-full"
                                            >
                                              <select
                                                className="border border-gray-300 p-1 text-xs w-full"
                                                value={editType}
                                                onChange={(e) =>
                                                  setEditType(
                                                    e.target.value as "page" | "board" | "hidden",
                                                  )
                                                }
                                              >
                                                <option value="page">페이지</option>
                                                <option value="board">게시판</option>
                                                <option value="hidden">숨김</option>
                                              </select>

                                              <select
                                                className="border border-gray-300 p-1 text-xs w-full"
                                                value={editTemplate}
                                                onChange={(e) => setEditTemplate(e.target.value)}
                                              >
                                                <option value="default">Default 템플릿</option>
                                                <option value="landing">Landing 템플릿</option>
                                                <option value="board">Board 템플릿</option>
                                                <option value="child">Child 템플릿</option>
                                              </select>

                                              <input
                                                className="border border-gray-300 p-1 text-xs w-full"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                required
                                                placeholder="페이지 제목"
                                              />

                                              <input
                                                className="border border-gray-300 p-1 text-xs w-full"
                                                value={editSlug}
                                                onChange={(e) => setEditSlug(e.target.value)}
                                                required
                                                placeholder="페이지 Slug"
                                              />

                                              <input
                                                className="border border-gray-300 p-1 text-xs w-full"
                                                value={editSeoTitle}
                                                onChange={(e) =>
                                                  setEditSeoTitle(e.target.value)
                                                }
                                                placeholder="SEO Title"
                                              />

                                              <textarea
                                                className="border border-gray-300 p-1 text-xs w-full"
                                                rows={2}
                                                value={editSeoDescription}
                                                onChange={(e) =>
                                                  setEditSeoDescription(e.target.value)
                                                }
                                                placeholder="SEO Description"
                                              />

                                              <div className="space-x-2 mt-1">
                                                <button
                                                  type="submit"
                                                  className="bg-blue-500 text-white px-3 py-1 text-xs rounded hover:bg-blue-600"
                                                >
                                                  저장
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={cancelEditPage}
                                                  className="text-xs text-gray-400 underline"
                                                >
                                                  취소
                                                </button>
                                              </div>
                                            </form>
                                          ) : (
                                            /* ---- 자식 일반 표시 ---- */
                                            <>
                                              <div>
                                                {child.title}
                                                <span className="text-gray-400 ml-1">
                                                  ({child.slug})
                                                </span>
                                                <span className="text-blue-600 ml-1">
                                                  [{child.type}]
                                                </span>
                                                {child.template && (
                                                  <span className="text-green-600 ml-1">
                                                    (템플릿: {child.template})
                                                  </span>
                                                )}
                                              </div>

                                              {!isManaging ? (
                                                <a
                                                  href={child.slug}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                                                >
                                                  바로가기
                                                </a>
                                              ) : (
                                                <div className="flex space-x-1">
                                                  <button
                                                    onClick={() => startEditPage(child)}
                                                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
                                                  >
                                                    편집
                                                  </button>
                                                  <button
                                                    onClick={() => handleDeletePage(child.id)}
                                                    className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                                                  >
                                                    삭제
                                                  </button>
                                                  {onEditWidgets && (
                                                    <button
                                                      onClick={() =>
                                                        onEditWidgets(
                                                          child.id,
                                                          child.seo_title || child.title,
                                                        )
                                                      }
                                                      className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
                                                    >
                                                      위젯 편집
                                                    </button>
                                                  )}
                                                </div>
                                              )}
                                            </>
                                          )}
                                        </li>
                                      )}
                                    </Draggable>
                                  ))}
                                  {childProv.placeholder}
                                </ul>
                              )}
                            </Droppable>
                          </DndContext>
                        </div>
                      )}
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DndContext>
    );
  }

  /* --------------------------- 최종 렌더 --------------------------- */
  return (
    <>
      {/* ---------- 메인 메뉴 ---------- */}
      {visibleParents.length > 0 && (
        <>
          <h3 className="font-semibold mb-1">메인 메뉴</h3>
          {renderParents(visibleParents)}
        </>
      )}

      {/* ---------- 기타 페이지 ---------- */}
      {hiddenParents.length > 0 && (
        <>
          <h3 className="font-semibold mt-6 mb-1">기타 페이지</h3>
          {renderParents(hiddenParents)}
        </>
      )}
    </>
  );
}
