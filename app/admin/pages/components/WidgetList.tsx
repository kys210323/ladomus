"use client";

import React, { useEffect, useState } from "react";

/** 위젯 구조 */
interface IWidget {
  id: number;
  page_id: number | null;
  board_id?: number | null;
  widget_type:
    | "header"
    | "text"
    | "image"
    | "carousel"
    | "fadeCarousel"
    | "button";
  data: string | any;
  sort_order: number;
}

interface WidgetListProps {
  pageId?: number;
  boardId?: number;
}

export default function WidgetList({ pageId, boardId }: WidgetListProps) {
  const [widgets, setWidgets] = useState<IWidget[]>([]);
  const [loading, setLoading] = useState(false);

  // 현재 "수정 모드"로 편집 중인 위젯 정보
  const [editWidgetId, setEditWidgetId] = useState<number | null>(null);
  const [editType, setEditType] = useState<IWidget["widget_type"]>("text");
  const [editSortOrder, setEditSortOrder] = useState<number>(0);
  const [editDataStr, setEditDataStr] = useState("");

  // 공통 groupId
  const [editGroupId, setEditGroupId] = useState("");

  // (1) text 관련
  const [editTextContent, setEditTextContent] = useState("");
  const [editTextColor, setEditTextColor] = useState("text-black");
  const [editTextSize, setEditTextSize] = useState("1rem");
  const [editTextFont, setEditTextFont] = useState("Times New Roman");
  const [editTextWeight, setEditTextWeight] = useState("400");
  const [editTextMAlign, setEditTextMAlign] = useState<"left" | "center" | "right">("left");
  const [editTextDAlign, setEditTextDAlign] = useState<"left" | "center" | "right">("left");

  // (2) image 관련
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editImageAlt, setEditImageAlt] = useState("");
  const [editImageSize, setEditImageSize] = useState<"original" | "medium" | "fullwidth">("original");
  const [editImageAlign, setEditImageAlign] = useState<"left" | "center" | "right">("left");

  // (3) button 관련
  const [editBtnText, setEditBtnText] = useState("");
  const [editBtnSize, setEditBtnSize] = useState<"small" | "normal" | "large" | "full">("normal");
  const [editBtnWeight, setEditBtnWeight] = useState<"400" | "700" | "900">("400");
  const [editBtnUrl, setEditBtnUrl] = useState("");
  const [editBtnTarget, setEditBtnTarget] = useState<"_self" | "_blank">("_self");

  // (4) fadeCarousel 추가 항목: aspectRatio
  const [editFadeAspect, setEditFadeAspect] = useState("16/9");

  // ----------------------
  // 1) 목록 불러오기
  // ----------------------
  async function loadWidgets() {
    if (!pageId && !boardId) return;
    setLoading(true);

    try {
      const query = pageId ? `?page_id=${pageId}` : `?board_id=${boardId}`;
      const res = await fetch(`/admin/pages/api/widgets${query}`);
      if (!res.ok) throw new Error("위젯 목록 가져오기 실패");
      const data: IWidget[] = await res.json();
      setWidgets(data);
    } catch (err) {
      console.error("loadWidgets error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWidgets();
  }, [pageId, boardId]);

  // ----------------------
  // 2) 삭제
  // ----------------------
  async function handleDeleteWidget(widgetId: number) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/admin/pages/api/widgets/${widgetId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("위젯 삭제 실패");
      loadWidgets();
    } catch (err) {
      console.error("handleDeleteWidget error:", err);
    }
  }

  // ----------------------
  // 3) 수정 모드 진입
  // ----------------------
  function startEditWidget(w: IWidget) {
    setEditWidgetId(w.id);
    setEditType(w.widget_type);
    setEditSortOrder(w.sort_order);

    // dataObj 파싱
    let dataObj: any = w.data;
    if (typeof dataObj === "string") {
      try {
        dataObj = JSON.parse(dataObj);
      } catch {
        dataObj = {};
      }
    }

    // 공통
    setEditGroupId(dataObj.groupId || "");

    // 분기 처리
    if (w.widget_type === "text") {
      setEditTextContent(dataObj.content || "");
      setEditTextColor(dataObj.color || "text-black");
      setEditTextSize(dataObj.size || "1rem");
      setEditTextFont(dataObj.font || "Times New Roman");
      setEditTextWeight(dataObj.weight || "400");
      setEditTextMAlign(dataObj.mAlign || "left");
      setEditTextDAlign(dataObj.dAlign || "left");
      setEditDataStr("");
    } else if (w.widget_type === "image") {
      setEditImageUrl(dataObj.src || "");
      setEditImageAlt(dataObj.alt || "");
      setEditImageSize(dataObj.size || "original");
      setEditImageAlign(dataObj.align || "left");
      setEditDataStr("");
    } else if (w.widget_type === "button") {
      setEditBtnText(dataObj.text || "");
      setEditBtnSize(dataObj.size || "normal");
      setEditBtnWeight(dataObj.weight || "400");
      setEditBtnUrl(dataObj.url || "");
      setEditBtnTarget(dataObj.target || "_self");
      setEditDataStr("");
    }
    // fadeCarousel → 별도 state
    else if (w.widget_type === "fadeCarousel") {
      setEditFadeAspect(dataObj.aspect || "16/9");
      // 이미지 배열 등은 JSON으로 직접 수정할 수도 있음
      setEditDataStr(JSON.stringify(dataObj, null, 2));
      // 다른 것들은 리셋
      setEditTextContent("");
      setEditImageUrl("");
      setEditBtnText("");
    }
    // header/carousel
    else {
      setEditDataStr(JSON.stringify(dataObj, null, 2));
      setEditTextContent("");
      setEditImageUrl("");
      setEditBtnText("");
    }
  }

  // ----------------------
  // 4) 수정 취소
  // ----------------------
  function cancelEdit() {
    setEditWidgetId(null);
  }

  // ----------------------
  // 5) 수정 저장
  // ----------------------
  async function saveEditWidget(e: React.FormEvent) {
    e.preventDefault();
    if (!editWidgetId) return;

    let finalData: any = {
      groupId: editGroupId,
    };

    if (editType === "text") {
      finalData.content = editTextContent;
      finalData.color = editTextColor;
      finalData.size = editTextSize;
      finalData.font = editTextFont;
      finalData.weight = editTextWeight;
      finalData.mAlign = editTextMAlign;
      finalData.dAlign = editTextDAlign;
    } else if (editType === "image") {
      finalData.src = editImageUrl;
      finalData.alt = editImageAlt;
      finalData.size = editImageSize;
      finalData.align = editImageAlign;
    } else if (editType === "button") {
      finalData.text = editBtnText;
      finalData.size = editBtnSize;
      finalData.weight = editBtnWeight;
      finalData.url = editBtnUrl;
      finalData.target = editBtnTarget;
    } else if (editType === "fadeCarousel") {
      // JSON + 인라인 aspect 동시 적용
      try {
        const parsed = JSON.parse(editDataStr);
        finalData = { ...finalData, ...parsed };
      } catch {
        alert("JSON parse 에러: data 필드를 올바른 JSON으로 입력해야 합니다.");
        return;
      }
      finalData.aspect = editFadeAspect;
    } else {
      // header, carousel -> JSON 그대로
      try {
        const parsed = JSON.parse(editDataStr);
        finalData = { ...finalData, ...parsed };
      } catch {
        alert("JSON parse 에러: data 필드를 올바른 JSON으로 입력해야 합니다.");
        return;
      }
    }

    const body = {
      widget_type: editType,
      sort_order: editSortOrder,
      data: finalData,
    };

    try {
      const res = await fetch(`/admin/pages/api/widgets/${editWidgetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("위젯 수정 실패");

      setEditWidgetId(null);
      loadWidgets();
    } catch (err) {
      console.error("saveEditWidget error:", err);
    }
  }

  // ----------------------
  // 6) 프리뷰
  // ----------------------
  function renderPreview(w: IWidget) {
    let dataObj: any = w.data;
    if (typeof dataObj === "string") {
      try {
        dataObj = JSON.parse(dataObj);
      } catch {}
    }

    switch (w.widget_type) {
      case "header":
        if (dataObj.bg) {
          return (
            <div className="w-24 h-16 overflow-hidden mx-auto bg-gray-200">
              <img
                src={dataObj.bg}
                alt="header"
                className="object-cover w-full h-full"
              />
            </div>
          );
        }
        break;

      case "image":
        if (dataObj.src) {
          return (
            <div className="w-24 h-16 overflow-hidden mx-auto bg-gray-200">
              <img
                src={dataObj.src}
                alt={dataObj.alt || "image"}
                className="object-cover w-full h-full"
              />
            </div>
          );
        }
        break;

      case "carousel":
        if (dataObj.images) {
          return (
            <div className="text-xs text-gray-600">
              캐러셀 {dataObj.images.length}장
            </div>
          );
        }
        break;

      case "fadeCarousel":
        if (dataObj.images) {
          return (
            <div className="text-xs text-gray-600">
              페이드 캐러셀 {dataObj.images.length}장
              <br />
              비율: {dataObj.aspect || "기본(16/9)"}
            </div>
          );
        }
        break;

      case "button":
        return (
          <button className="border px-2 py-1">
            {dataObj.text || "버튼"}
          </button>
        );

      case "text":
        if (dataObj.content) {
          return <p className="text-sm">{dataObj.content}</p>;
        }
        break;
    }

    // 그 외
    return (
      <pre className="text-xs whitespace-pre-wrap text-left">
        {JSON.stringify(dataObj, null, 2)}
      </pre>
    );
  }

  const targetInfo = pageId
    ? `page_id: ${pageId}`
    : boardId
    ? `board_id: ${boardId}`
    : "(no target)";

  return (
    <div className="mt-4 text-center">
      <h3 className="text-md font-semibold mb-3">위젯 목록 ({targetInfo})</h3>
      {loading && <p className="text-gray-500">로딩중...</p>}

      {widgets.length === 0 ? (
        <p className="text-sm text-gray-500">위젯이 없습니다.</p>
      ) : (
        <table className="table-auto w-full border border-gray-300 text-sm mx-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 border-b border-gray-300">ID</th>
              <th className="p-2 border-b border-gray-300">Type</th>
              <th className="p-2 border-b border-gray-300">Group</th>
              <th className="p-2 border-b border-gray-300">Sort</th>
              <th className="p-2 border-b border-gray-300">Preview/Data</th>
              <th className="p-2 border-b border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {widgets.map((w) => {
              const editing = editWidgetId === w.id;

              // groupId 표시
              let dataObj: any = w.data;
              if (typeof dataObj === "string") {
                try {
                  dataObj = JSON.parse(dataObj);
                } catch {}
              }
              const groupIdVal = dataObj?.groupId || "";

              return (
                <tr key={w.id} className="border-b border-gray-300 last:border-0">
                  {editing ? (
                    <>
                      {/* 수정 모드 */}
                      <td className="p-2 border-r border-gray-300 text-center">
                        {w.id}
                      </td>
                      <td className="p-2 border-r border-gray-300">
                        <select
                          className="border border-gray-300 text-xs p-1"
                          value={editType}
                          onChange={(e) =>
                            setEditType(e.target.value as IWidget["widget_type"])
                          }
                        >
                          <option value="header">header</option>
                          <option value="text">text</option>
                          <option value="image">image</option>
                          <option value="carousel">carousel</option>
                          <option value="fadeCarousel">fadeCarousel</option>
                          <option value="button">button</option>
                        </select>
                      </td>
                      <td className="p-2 border-r border-gray-300 text-center">
                        <input
                          type="text"
                          className="border border-gray-300 w-12 text-xs p-1"
                          value={editGroupId}
                          onChange={(e) => setEditGroupId(e.target.value)}
                        />
                      </td>
                      <td className="p-2 border-r border-gray-300">
                        <input
                          type="number"
                          className="border border-gray-300 w-14 text-xs p-1"
                          value={editSortOrder}
                          onChange={(e) =>
                            setEditSortOrder(parseInt(e.target.value, 10))
                          }
                        />
                      </td>
                      <td className="p-2 border-r border-gray-300 align-top">
                        {/* (A) text 편집 */}
                        {editType === "text" && (
                          <div className="space-y-1 text-left text-xs">
                            <label>내용</label>
                            <textarea
                              rows={3}
                              className="border w-full text-xs p-1"
                              value={editTextContent}
                              onChange={(e) => setEditTextContent(e.target.value)}
                            />
                            <label>색상</label>
                            <select
                              className="border w-full text-xs p-1"
                              value={editTextColor}
                              onChange={(e) => setEditTextColor(e.target.value)}
                            >
                              <option value="text-black">검정</option>
                              <option value="text-red-500">빨강</option>
                              <option value="text-blue-500">파랑</option>
                              <option value="text-green-500">초록</option>
                              <option value="text-beige-gold">베이지골드</option>
                            </select>
                            <label>크기</label>
                            <select
                              className="border w-full text-xs p-1"
                              value={editTextSize}
                              onChange={(e) => setEditTextSize(e.target.value)}
                            >
                              <option value="1rem">1rem</option>
                              <option value="1.2rem">1.2rem</option>
                              <option value="1.5rem">1.5rem</option>
                              <option value="2rem">2rem</option>
                            </select>
                            <label>폰트</label>
                            <select
                              className="border w-full text-xs p-1"
                              value={editTextFont}
                              onChange={(e) => setEditTextFont(e.target.value)}
                            >
                              <option value="Times New Roman">Times</option>
                              <option value="Roboto, sans-serif">Roboto</option>
                              <option value="Arial, sans-serif">Arial</option>
                            </select>
                            <label>굵기</label>
                            <select
                              className="border w-full text-xs p-1"
                              value={editTextWeight}
                              onChange={(e) => setEditTextWeight(e.target.value)}
                            >
                              <option value="100">Thin(100)</option>
                              <option value="300">Light(300)</option>
                              <option value="400">Regular(400)</option>
                              <option value="500">Medium(500)</option>
                              <option value="700">Bold(700)</option>
                              <option value="900">Black(900)</option>
                            </select>
                            <label>모바일 정렬</label>
                            <select
                              className="border w-full text-xs p-1"
                              value={editTextMAlign}
                              onChange={(e) =>
                                setEditTextMAlign(e.target.value as "left" | "center" | "right")
                              }
                            >
                              <option value="left">왼쪽</option>
                              <option value="center">중앙</option>
                              <option value="right">오른쪽</option>
                            </select>
                            <label>데스크톱 정렬</label>
                            <select
                              className="border w-full text-xs p-1"
                              value={editTextDAlign}
                              onChange={(e) =>
                                setEditTextDAlign(e.target.value as "left" | "center" | "right")
                              }
                            >
                              <option value="left">왼쪽</option>
                              <option value="center">중앙</option>
                              <option value="right">오른쪽</option>
                            </select>
                          </div>
                        )}

                        {/* (B) image 편집 */}
                        {editType === "image" && (
                          <div className="space-y-1 text-left text-xs">
                            <label>이미지 URL</label>
                            <input
                              type="text"
                              className="border w-full text-xs p-1"
                              value={editImageUrl}
                              onChange={(e) => setEditImageUrl(e.target.value)}
                            />
                            <label>ALT</label>
                            <input
                              type="text"
                              className="border w-full text-xs p-1"
                              value={editImageAlt}
                              onChange={(e) => setEditImageAlt(e.target.value)}
                            />
                            <label>크기</label>
                            <select
                              className="border w-full text-xs p-1"
                              value={editImageSize}
                              onChange={(e) =>
                                setEditImageSize(e.target.value as "original" | "medium" | "fullwidth")
                              }
                            >
                              <option value="original">원본</option>
                              <option value="medium">중간</option>
                              <option value="fullwidth">꽉참</option>
                            </select>
                            <label>정렬</label>
                            <select
                              className="border w-full text-xs p-1"
                              value={editImageAlign}
                              onChange={(e) =>
                                setEditImageAlign(e.target.value as "left" | "center" | "right")
                              }
                            >
                              <option value="left">왼쪽</option>
                              <option value="center">중앙</option>
                              <option value="right">오른쪽</option>
                            </select>
                          </div>
                        )}

                        {/* (C) button 편집 */}
                        {editType === "button" && (
                          <div className="space-y-1 text-left text-xs">
                            <label>버튼 텍스트</label>
                            <input
                              type="text"
                              className="border w-full text-xs p-1"
                              value={editBtnText}
                              onChange={(e) => setEditBtnText(e.target.value)}
                            />
                            <label>버튼 크기</label>
                            <select
                              className="border w-full text-xs p-1"
                              value={editBtnSize}
                              onChange={(e) =>
                                setEditBtnSize(e.target.value as "small" | "normal" | "large" | "full")
                              }
                            >
                              <option value="small">작게</option>
                              <option value="normal">보통</option>
                              <option value="large">크게</option>
                              <option value="full">꽉참</option>
                            </select>
                            <label>글자 굵기</label>
                            <select
                              className="border w-full text-xs p-1"
                              value={editBtnWeight}
                              onChange={(e) =>
                                setEditBtnWeight(e.target.value as "400" | "700" | "900")
                              }
                            >
                              <option value="400">보통(400)</option>
                              <option value="700">굵게(700)</option>
                              <option value="900">아주굵게(900)</option>
                            </select>
                            <label>링크 URL</label>
                            <input
                              type="text"
                              className="border w-full text-xs p-1"
                              value={editBtnUrl}
                              onChange={(e) => setEditBtnUrl(e.target.value)}
                            />
                            <label>Target</label>
                            <select
                              className="border w-full text-xs p-1"
                              value={editBtnTarget}
                              onChange={(e) =>
                                setEditBtnTarget(e.target.value as "_self" | "_blank")
                              }
                            >
                              <option value="_self">같은탭(_self)</option>
                              <option value="_blank">새탭(_blank)</option>
                            </select>
                          </div>
                        )}

                        {/* (D) fadeCarousel 편집 (aspect + JSON) */}
                        {editType === "fadeCarousel" && (
                          <div className="space-y-1 text-left text-xs">
                            <label>Aspect Ratio (예: 16/9, 4/3)</label>
                            <input
                              type="text"
                              className="border w-full text-xs p-1"
                              value={editFadeAspect}
                              onChange={(e) => setEditFadeAspect(e.target.value)}
                            />
                            <p className="text-gray-500 text-xs">
                              ↓ 캐러셀 이미지 목록 등은 JSON으로 수정
                            </p>
                            <textarea
                              rows={5}
                              className="border w-full text-xs p-1 text-left"
                              value={editDataStr}
                              onChange={(e) => setEditDataStr(e.target.value)}
                            />
                          </div>
                        )}

                        {/* (E) header/carousel (JSON만 편집) */}
                        {editType !== "text" &&
                          editType !== "image" &&
                          editType !== "button" &&
                          editType !== "fadeCarousel" && (
                            <>
                              <textarea
                                rows={5}
                                className="border w-full text-xs p-1 text-left mt-2"
                                value={editDataStr}
                                onChange={(e) => setEditDataStr(e.target.value)}
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                JSON 형식으로 수정
                              </p>
                            </>
                          )}
                      </td>
                      <td className="p-2 text-xs">
                        <button
                          className="bg-blue-500 text-white px-2 py-1 mr-1 rounded cursor-pointer"
                          onClick={saveEditWidget}
                        >
                          저장
                        </button>
                        <button
                          className="text-gray-400 underline cursor-pointer"
                          onClick={cancelEdit}
                        >
                          취소
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      {/* 일반 모드 */}
                      <td className="p-2 border-r border-gray-300 text-center">
                        {w.id}
                      </td>
                      <td className="p-2 border-r border-gray-300">
                        {w.widget_type}
                      </td>
                      <td className="p-2 border-r border-gray-300 text-center">
                        {groupIdVal}
                      </td>
                      <td className="p-2 border-r border-gray-300 text-center">
                        {w.sort_order}
                      </td>
                      <td className="p-2 border-r border-gray-300">
                        {renderPreview(w)}
                      </td>
                      <td className="p-2 text-xs">
                        <button
                          className="text-blue-500 mr-2 underline cursor-pointer"
                          onClick={() => startEditWidget(w)}
                        >
                          수정
                        </button>
                        <button
                          className="text-red-500 underline cursor-pointer"
                          onClick={() => handleDeleteWidget(w.id)}
                        >
                          삭제
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
