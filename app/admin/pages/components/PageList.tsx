"use client";

import React, { useState } from "react";
import {
  DragDropContext as DndContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd";
import type { IPage } from "../page";

interface Props {
  parents: IPage[];
  setParents: React.Dispatch<React.SetStateAction<IPage[]>>;
  isSorting: boolean;
  isManaging: boolean;
  loadParents: ()=>void;
}

export default function PageList({
  parents,
  setParents,
  isSorting,
  isManaging,
  loadParents
}: Props) {

  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [editPageId, setEditPageId] = useState<number|null>(null);

  const [editType, setEditType] = useState<"page"|"board">("page");
  const [editTemplate, setEditTemplate] = useState<string>("default");
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editContent, setEditContent] = useState("");

  function toggleExpand(id:number){
    if(expandedIds.includes(id)){
      setExpandedIds(expandedIds.filter(x=>x!==id));
    } else {
      setExpandedIds([...expandedIds, id]);
    }
  }

  // ===============================
  // 1) 드래그 (부모)
  // ===============================
  async function onDragEndParents(result: DropResult) {
    if(!result.destination) return;
    if(result.source.index===result.destination.index) return;

    const arr = [...parents];
    const [moved] = arr.splice(result.source.index,1);
    if(!moved) return;

    arr.splice(result.destination.index,0,moved);
    arr.forEach((p,i)=>{ p.sortOrder=i; });
    setParents(arr);

    // PATCH /admin/pages/api/hierarchy/parentsort
    const payload = arr.map(p=>({ id:p.id, sortOrder:p.sortOrder??0 }));
    await fetch("/admin/pages/api/hierarchy/parentsort", {
      method:"PATCH",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload),
    });
  }

  // ===============================
  // 2) 드래그 (자식)
  // ===============================
  async function onDragEndChildren(parentId:number, result: DropResult){
    if(!result.destination) return;
    if(result.source.index===result.destination.index) return;

    const idx = parents.findIndex(p=>p.id===parentId);
    if(idx<0) return;
    const parent = parents[idx];
    if(!parent.children) return;

    const arr = [...parent.children];
    const [moved] = arr.splice(result.source.index,1);
    if(!moved) return;

    arr.splice(result.destination.index,0,moved);
    arr.forEach((c,i)=>{ c.sortOrder=i; });

    const newParents = [...parents];
    newParents[idx] = {...parent, children: arr};
    setParents(newParents);

    // PATCH /admin/pages/api/hierarchy/childsort
    const payload = {
      parentId,
      children: arr.map(c=>({ id:c.id, sortOrder:c.sortOrder??0 }))
    };
    await fetch("/admin/pages/api/hierarchy/childsort", {
      method:"PATCH",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload),
    });
  }

  // ===============================
  // 3) 편집
  // ===============================
  function startEditPage(page: IPage) {
    setEditPageId(page.id);
    setEditType(page.type);
    setEditTemplate(page.template ?? "default"); // ★ template
    setEditTitle(page.title);
    setEditSlug(page.slug);
    setEditContent(page.content ?? "");
  }
  function cancelEditPage() {
    setEditPageId(null);
  }
  async function saveEditPage(e: React.FormEvent) {
    e.preventDefault();
    if(!editPageId) return;

    let raw = editSlug.trim().toLowerCase();
    if(!raw.startsWith("/")) raw = "/"+raw;

    // PUT /admin/pages/api
    const body = {
      id: editPageId,
      type: editType,
      template: editTemplate, // ★ template
      title: editTitle,
      slug: raw,
      content: editContent,
    };
    const res = await fetch("/admin/pages/api", {
      method:"PUT",
      headers:{ "Content-Type":"application/json"},
      body: JSON.stringify(body),
    });
    if(res.ok){
      setEditPageId(null);
      loadParents();
    }
  }

  // ===============================
  // 4) 삭제
  // ===============================
  async function handleDeletePage(pageId:number){
    if(!confirm("정말 삭제하시겠습니까?")) return;
    // DELETE /admin/pages/api?id=...
    const res = await fetch(`/admin/pages/api?id=${pageId}`, { method:"DELETE" });
    if(res.ok){
      loadParents();
    }
  }

  // ===============================
  // renderParents()
  // ===============================
  function renderParentList(){
    return (
      <DndContext onDragEnd={onDragEndParents}>
        <Droppable droppableId="parents">
          {(provided)=>(
            <ul
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="divide-y divide-gray-200"
            >
              {parents.map((parent,pIndex)=>(
                <Draggable
                  key={parent.id}
                  draggableId={`parent-${parent.id}`}
                  index={pIndex}
                  isDragDisabled={!isSorting}
                >
                  {(prov)=>(
                    <li
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      {...prov.dragHandleProps}
                      className="py-2"
                    >
                      {editPageId===parent.id ? (
                        // 인라인 편집 (부모)
                        <form onSubmit={saveEditPage} className="space-y-1 text-xs">
                          <select
                            className="border border-gray-300 p-1 text-xs w-full"
                            value={editType}
                            onChange={(e)=>setEditType(e.target.value as "page"|"board")}
                          >
                            <option value="page">페이지</option>
                            <option value="board">게시판</option>
                          </select>
                          {/* template */}
                          <select
                            className="border border-gray-300 p-1 text-xs w-full"
                            value={editTemplate}
                            onChange={(e)=>setEditTemplate(e.target.value)}
                          >
                            <option value="default">Default 템플릿</option>
                            <option value="landing">Landing 템플릿</option>
                            <option value="board">Board 템플릿</option>
                          </select>
                          <input
                            className="border border-gray-300 p-1 text-xs w-full"
                            value={editTitle}
                            onChange={(e)=>setEditTitle(e.target.value)}
                            required
                          />
                          <input
                            className="border border-gray-300 p-1 text-xs w-full"
                            value={editSlug}
                            onChange={(e)=>setEditSlug(e.target.value)}
                            required
                          />
                          <textarea
                            className="border border-gray-300 p-1 text-xs w-full"
                            rows={2}
                            value={editContent}
                            onChange={(e)=>setEditContent(e.target.value)}
                          />
                          <div className="space-x-2">
                            <button
                              type="submit"
                              className="bg-blue-500 text-white px-3 py-1 text-xs rounded hover:cursor-pointer"
                            >
                              저장
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditPage}
                              className="text-xs text-gray-400 underline hover:cursor-pointer"
                            >
                              취소
                            </button>
                          </div>
                        </form>
                      ) : (
                        // 일반 표시 (부모)
                        <div className="flex items-center justify-between">
                          <div>
                            <strong>{parent.title}</strong>{" "}
                            <span className="text-gray-400">({parent.slug})</span>
                            <span className="text-blue-600 ml-1">
                              [{parent.type}]
                            </span>
                            {parent.template && (
                              <span className="text-green-600 ml-1">
                                (템플릿: {parent.template})
                              </span>
                            )}
                            {parent.children && parent.children.length>0 && (
                              <button
                                onClick={()=>toggleExpand(parent.id)}
                                className="ml-2 text-xs underline text-gray-500 hover:cursor-pointer"
                              >
                                {expandedIds.includes(parent.id)
                                  ? "접기"
                                  : `+(${parent.children.length})`
                                }
                              </button>
                            )}
                          </div>

                          {/* 관리 모드 vs 링크 */}
                          {!isManaging ? (
                            <a
                              href={parent.slug}
                              target="_blank"
                              className="text-gray-600 underline hover:cursor-pointer text-xs"
                            >
                              바로가기
                            </a>
                          ) : (
                            <div className="flex space-x-2 text-xs">
                              <button
                                onClick={()=>startEditPage(parent)}
                                className="text-blue-500 underline hover:cursor-pointer"
                              >
                                편집
                              </button>
                              <button
                                onClick={()=>handleDeletePage(parent.id)}
                                className="text-red-500 underline hover:cursor-pointer"
                              >
                                삭제
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      {/* 자식 */}
                      {expandedIds.includes(parent.id) && parent.children && (
                        <div className="ml-6 mt-2 border-l pl-2">
                          <DndContext onDragEnd={(r)=>onDragEndChildren(parent.id, r)}>
                            <Droppable droppableId={`child-${parent.id}`}>
                              {(childProv)=>(
                                <ul
                                  ref={childProv.innerRef}
                                  {...childProv.droppableProps}
                                  className="divide-y divide-gray-200"
                                >
                                  {parent.children?.map((child,cIndex)=>(
                                    <Draggable
                                      key={child.id}
                                      draggableId={`child-${child.id}`}
                                      index={cIndex}
                                      isDragDisabled={!isSorting}
                                    >
                                      {(cprov)=>(
                                        <li
                                          ref={cprov.innerRef}
                                          {...cprov.draggableProps}
                                          {...cprov.dragHandleProps}
                                          className="py-1 flex justify-between text-sm"
                                        >
                                          {editPageId===child.id ? (
                                            // 인라인 편집 (자식)
                                            <form onSubmit={saveEditPage} className="space-y-1 text-xs w-full">
                                              <select
                                                className="border border-gray-300 p-1 text-xs w-full"
                                                value={editType}
                                                onChange={(e)=>setEditType(e.target.value as "page"|"board")}
                                              >
                                                <option value="page">페이지</option>
                                                <option value="board">게시판</option>
                                              </select>
                                              {/* template */}
                                              <select
                                                className="border border-gray-300 p-1 text-xs w-full"
                                                value={editTemplate}
                                                onChange={(e)=>setEditTemplate(e.target.value)}
                                              >
                                                <option value="default">Default 템플릿</option>
                                                <option value="landing">Landing 템플릿</option>
                                                <option value="board">Board 템플릿</option>
                                              </select>
                                              <input
                                                className="border border-gray-300 p-1 text-xs w-full"
                                                value={editTitle}
                                                onChange={(e)=>setEditTitle(e.target.value)}
                                                required
                                              />
                                              <input
                                                className="border border-gray-300 p-1 text-xs w-full"
                                                value={editSlug}
                                                onChange={(e)=>setEditSlug(e.target.value)}
                                                required
                                              />
                                              <textarea
                                                className="border border-gray-300 p-1 text-xs w-full"
                                                rows={2}
                                                value={editContent}
                                                onChange={(e)=>setEditContent(e.target.value)}
                                              />
                                              <div className="space-x-2">
                                                <button
                                                  type="submit"
                                                  className="bg-blue-500 text-white px-3 py-1 text-xs rounded hover:cursor-pointer"
                                                >
                                                  저장
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={cancelEditPage}
                                                  className="text-xs text-gray-400 underline hover:cursor-pointer"
                                                >
                                                  취소
                                                </button>
                                              </div>
                                            </form>
                                          ) : (
                                            <>
                                              <div>
                                                {child.title}
                                                <span className="text-gray-400 ml-1">({child.slug})</span>
                                                <span className="text-blue-600 ml-1">[{child.type}]</span>
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
                                                  className="text-gray-600 underline hover:cursor-pointer text-xs"
                                                >
                                                  바로가기
                                                </a>
                                              ) : (
                                                <div className="flex space-x-2 text-xs">
                                                  <button
                                                    onClick={()=>startEditPage(child)}
                                                    className="text-blue-500 underline hover:cursor-pointer"
                                                  >
                                                    편집
                                                  </button>
                                                  <button
                                                    onClick={()=>handleDeletePage(child.id)}
                                                    className="text-red-500 underline hover:cursor-pointer"
                                                  >
                                                    삭제
                                                  </button>
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

  return (
    <>{renderParentList()}</>
  );
}
