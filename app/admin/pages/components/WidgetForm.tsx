/* =========================================================================
   app/admin/pages/components/WidgetForm.tsx
   Tailwind Tiptap Widget Form – WYSIWYG + 이미지 업로드 + ImageGroup
   =========================================================================*/
   "use client";

   import React, { useEffect, useRef, useState } from "react";
   import ImageUploadForm from "./ImageUploadForm";
   
   import { useEditor, EditorContent } from "@tiptap/react";
   import StarterKit from "@tiptap/starter-kit";
   import Image from "@tiptap/extension-image";
   
   import { TailwindMark } from "./tiptap-extensions/TailwindMark";
   import { TailwindParagraph } from "./tiptap-extensions/TailwindParagraph";
   import { ImageGroup } from "./tiptap-extensions/ImageGroup";
   import { ImageSelectionDecoration } from "./tiptap-extensions/ImageSelectionDecoration";
   import { HighlightPlugin } from "./tiptap-extensions/HighlightPlugin";
   
   import {
     ChevronDownIcon,
     Bars3Icon,
     Bars3BottomLeftIcon,
     Bars3BottomRightIcon,
     PhotoIcon,
   } from "@heroicons/react/24/outline";
   
   /* ------------------------------------------------------------------ */
   /* 타입 선언 보강 – setImage 체이닝 명령 TS 지원                       */
   /* ------------------------------------------------------------------ */
   declare module "@tiptap/core" {
     interface Commands<ReturnType> {
       image: {
         setImage: (options: { src: string; alt?: string; title?: string }) => ReturnType;
       };
     }
   }
   
   /* ------------------------------------------------------------------ */
   /* 타입 / 상수                                                         */
   /* ------------------------------------------------------------------ */
   type WidgetType =
     | "header"
     | "text"
     | "image"
     | "carousel"
     | "fadeCarousel"
     | "button";
   
   type ImageSizeOption = "original" | "medium" | "fullwidth";
   type ImageAlignOption = "left" | "center" | "right";
   type ButtonSizeOption = "small" | "normal" | "large" | "full";
   type AspectRatioOption = "16/9" | "4/3" | "1/1" | "custom";
   
   interface WidgetFormProps {
     pageId?: number;
     boardId?: number;
     onCreated?: () => void;
   }
   
   const fontOptions = ["Times New Roman", "Roboto, sans-serif", "Arial, sans-serif"] as const;
   const sizeOptions = ["1rem", "1.2rem", "1.5rem", "2rem"] as const;
   const weightOptions = ["100", "300", "400", "500", "700", "900"] as const;
   const colorPalette = [
     { label: "Black", value: "#000000" },
     { label: "Gray 500", value: "#6b7280" },
     { label: "Red 500", value: "#ef4444" },
     { label: "Blue 500", value: "#3b82f6" },
     { label: "Green 500", value: "#22c55e" },
     { label: "베이지골드", value: "#9e896e" },
   ];
   
   /* =====================================================================
      메인 컴포넌트
   =====================================================================*/
   export default function WidgetForm({ pageId, boardId, onCreated }: WidgetFormProps) {
     /* ---------------- 공통 State ---------------- */
     const [widgetType, setWidgetType] = useState<WidgetType>("header");
     const [sortOrder, setSortOrder] = useState(0);
     const [groupId, setGroupId] = useState(0);
   
     /* ---------------- 정렬 ---------------- */
     const [textDAlign, setTextDAlign] = useState<"left" | "center" | "right">("left");
     const [textMAlign, setTextMAlign] = useState<"left" | "center" | "right">("left");
   
     /* ---------------- dropdown ---------------- */
     const [showFontMenu, setShowFontMenu] = useState(false);
     const [showSizeMenu, setShowSizeMenu] = useState(false);
     const [showWeightMenu, setShowWeightMenu] = useState(false);
     const [showColorMenu, setShowColorMenu] = useState(false);
     const [showPCAlignMenu, setShowPCAlignMenu] = useState(false);
     const [showMobileAlignMenu, setShowMobileAlignMenu] = useState(false);
   
     /* ---------------- 기타 위젯 State ---------------- */
     const [bgImageUrl, setBgImageUrl] = useState("");
   
     const [imageUrl, setImageUrl] = useState("");
     const [imageAlt, setImageAlt] = useState("");
     const [imageSize, setImageSize] = useState<ImageSizeOption>("original");
     const [imageAlign, setImageAlign] = useState<ImageAlignOption>("left");
   
     const [carouselImages, setCarouselImages] = useState<string[]>([]);
     const [autoplay, setAutoplay] = useState(false);
     const [delay, setDelay] = useState(3000);
   
     const [fadeImages, setFadeImages] = useState<string[]>([]);
     const [fadeRatio, setFadeRatio] = useState<AspectRatioOption>("16/9");
     const [fadeCustomRatio, setFadeCustomRatio] = useState("");
   
     const [btnText, setBtnText] = useState("");
     const [btnSize, setBtnSize] = useState<ButtonSizeOption>("normal");
     const [btnWeight, setBtnWeight] = useState<"400" | "700" | "900">("400");
     const [btnUrl, setBtnUrl] = useState("");
     const [btnTarget, setBtnTarget] = useState<"_self" | "_blank">("_self");
   
     /* =================================================================
        Tiptap Editor – 핵심 확장 세팅
     ================================================================= */
     const editor = useEditor({
       extensions: [
         StarterKit.configure({
           paragraph: false,
           blockquote: false,
           bulletList: false,
           orderedList: false,
           heading: false,
           codeBlock: false,
           code: false,
         }),
         TailwindParagraph,
         TailwindMark,
         Image,
         ImageGroup,
         ImageSelectionDecoration,
         HighlightPlugin,
       ],
       content: '<p class="text-left md:text-left"><br /></p>',
       editorProps: { attributes: { class: "ProseMirror focus:outline-none w-full block" } },
       immediatelyRender: false,
     });
   
     /* =================================================================
        툴바 메뉴 제어
     ================================================================= */
     const closeAllMenus = () => {
       setShowFontMenu(false);
       setShowSizeMenu(false);
       setShowWeightMenu(false);
       setShowColorMenu(false);
       setShowPCAlignMenu(false);
       setShowMobileAlignMenu(false);
     };
     const toolbarRef = useRef<HTMLDivElement>(null);
     useEffect(() => {
       const handleDocClick = (e: MouseEvent) => {
         if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) closeAllMenus();
       };
       document.addEventListener("mousedown", handleDocClick);
       return () => document.removeEventListener("mousedown", handleDocClick);
     }, []);
   
     /* =================================================================
        Tailwind helper 커맨드
     ================================================================= */
     const setFont = (f: string) => editor?.chain().focus().setTailwindMark({ fontFamily: f }).run();
     const setSize = (s: string) => editor?.chain().focus().setTailwindMark({ fontSize: s }).run();
     const setWeight = (w: string) => editor?.chain().focus().setTailwindMark({ fontWeight: w }).run();
     const setColor = (c: string) => editor?.chain().focus().setTailwindMark({ textColor: c }).run();
     const setPcAlign = (pc: "left" | "center" | "right") => editor?.chain().focus().setPcAlign(pc).run();
     const setMobAlign = (m: "left" | "center" | "right") => editor?.chain().focus().setMobileAlign(m).run();
   
     /* =================================================================
        이미지 업로드 util – 응답 { urls:[…] } 처리
     ================================================================= */
     async function uploadFile(file: File): Promise<string> {
       const form = new FormData();
       form.append("file", file);
       const res = await fetch("/admin/api/upload", { method: "POST", body: form });
       if (!res.ok) throw new Error("upload fail");
       const data = await res.json();
       const url = Array.isArray(data.urls) ? data.urls[0] : undefined;
       if (!url) throw new Error("upload response missing urls");
       return url;
     }
     const fileInputRef = useRef<HTMLInputElement>(null);
   
     /* =================================================================
        외부 이미지 업로드 콜백
     ================================================================= */
     function handleImageUploaded(urls: string[]) {
       if (!urls.length) return;
       const first = urls[0];
       switch (widgetType) {
         case "header":
           setBgImageUrl(first);
           break;
         case "image":
           setImageUrl(first);
           break;
         case "carousel":
           setCarouselImages((p) => [...p, ...urls]);
           break;
         case "fadeCarousel":
           setFadeImages((p) => [...p, ...urls]);
           break;
       }
     }
   
     /* =================================================================
        저장 로직
     ================================================================= */
     async function handleCreate(e: React.FormEvent) {
       e.preventDefault();
   
       const dataField: any = { groupId: groupId || 0 };
       switch (widgetType) {
         case "header":
           dataField.bg = bgImageUrl;
           break;
         case "text":
           dataField.content = editor?.getHTML() || "";
           break;
         case "image":
           dataField.src = imageUrl;
           dataField.alt = imageAlt;
           dataField.size = imageSize;
           dataField.align = imageAlign;
           break;
         case "carousel":
           dataField.images = carouselImages.map((src) => ({ src }));
           dataField.autoplay = autoplay;
           dataField.delay = delay;
           break;
         case "fadeCarousel":
           dataField.images = fadeImages.map((src) => ({ src }));
           dataField.aspect =
             fadeRatio === "custom" && fadeCustomRatio ? fadeCustomRatio : fadeRatio;
           break;
         case "button":
           dataField.text = btnText;
           dataField.size = btnSize;
           dataField.weight = btnWeight;
           dataField.url = btnUrl;
           dataField.target = btnTarget;
           break;
       }
   
       const body = {
         page_id: pageId ?? null,
         board_id: boardId ?? null,
         widget_type: widgetType,
         sort_order: sortOrder,
         data: dataField,
       };
   
       const res = await fetch("/admin/pages/api/widgets", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
       });
       if (!res.ok) {
         console.error(await res.text());
         alert("위젯 생성 실패");
         return;
       }
   
       /* 상태 리셋 */
       setWidgetType("header");
       setSortOrder(0);
       setGroupId(0);
       editor?.commands.setContent('<p class="text-left md:text-left"><br /></p>');
   
       setBgImageUrl("");
       setImageUrl("");
       setImageAlt("");
       setImageSize("original");
       setImageAlign("left");
   
       setCarouselImages([]);
       setAutoplay(false);
       setDelay(3000);
   
       setFadeImages([]);
       setFadeRatio("16/9");
       setFadeCustomRatio("");
   
       setBtnText("");
       setBtnSize("normal");
       setBtnWeight("400");
       setBtnUrl("");
       setBtnTarget("_self");
   
       onCreated?.();
     }
   
     /* =================================================================
        프리뷰 helpers
     ================================================================= */
     const renderHeaderPreview = () =>
       bgImageUrl && (
         <div className="mt-2" style={{ width: 300, height: 150, border: "1px solid #ccc" }}>
           <img src={bgImageUrl} alt="" className="w-full h-full object-cover" />
         </div>
       );
   
     const renderCarouselPreview = () =>
       carouselImages.length > 0 && (
         <div className="space-y-1 mt-2">
           <p className="text-sm text-gray-600">총 {carouselImages.length}장</p>
           <div className="flex flex-wrap gap-2">
             {carouselImages.map((src, i) => (
               <div key={i} style={{ width: 80, height: 60, overflow: "hidden" }}>
                 <img src={src} alt="" className="w-full h-full object-cover" />
               </div>
             ))}
           </div>
         </div>
       );
   
     const renderFadeCarouselPreview = () =>
       fadeImages.length > 0 && (
         <div className="space-y-1 mt-2">
           <p className="text-sm text-gray-600">총 {fadeImages.length}장</p>
           <div className="flex flex-wrap gap-2">
             {fadeImages.map((src, i) => (
               <div key={i} style={{ width: 80, height: 60, overflow: "hidden" }}>
                 <img src={src} alt="" className="w-full h-full object-cover" />
               </div>
             ))}
           </div>
         </div>
       );
   
     /* =================================================================
        JSX 렌더
     ================================================================= */
     return (
       <div className="w-full min-h-screen p-6 bg-gray-50">
         <h3 className="text-lg font-semibold text-center mb-4">위젯 생성 (Tailwind Tiptap)</h3>
   
         <form
           onSubmit={handleCreate}
           className="w-full space-y-4 text-sm border border-gray-300 bg-white p-4 rounded"
         >
           {/* ---- 기본 입력 ---- */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
             <div>
               <label className="block font-medium mb-1">Widget Type</label>
               <select
                 className="border border-gray-300 p-1 rounded w-full cursor-pointer"
                 value={widgetType}
                 onChange={(e) => setWidgetType(e.target.value as WidgetType)}
               >
                 <option value="header">header</option>
                 <option value="text">text</option>
                 <option value="image">image</option>
                 <option value="carousel">carousel</option>
                 <option value="fadeCarousel">fadeCarousel</option>
                 <option value="button">button</option>
               </select>
             </div>
             <div>
               <label className="block font-medium mb-1">Sort Order</label>
               <input
                 type="number"
                 className="border border-gray-300 p-1 rounded w-full"
                 value={sortOrder}
                 onChange={(e) => setSortOrder(+e.target.value)}
               />
             </div>
             <div>
               <label className="block font-medium mb-1">Group ID</label>
               <input
                 type="number"
                 className="border border-gray-300 p-1 rounded w-full"
                 value={groupId}
                 onChange={(e) => setGroupId(+e.target.value || 0)}
               />
             </div>
           </div>
   
           {/* ---- TEXT 위젯 ---- */}
           {widgetType === "text" && editor && (
             <div className="space-y-3">
               {/* 툴바 */}
               <div
                 ref={toolbarRef}
                 className="flex flex-wrap items-center gap-2 p-2 bg-gray-100 rounded"
               >
                 {/* 폰트 */}
                 <Dropdown
                   label="폰트"
                   show={showFontMenu}
                   setShow={setShowFontMenu}
                   onOpen={closeAllMenus}
                 >
                   {fontOptions.map((f) => (
                     <DropdownItem key={f} onClick={() => setFont(f)}>
                       {f}
                     </DropdownItem>
                   ))}
                 </Dropdown>
   
                 {/* 글자 크기 */}
                 <Dropdown
                   label="글자 크기"
                   show={showSizeMenu}
                   setShow={setShowSizeMenu}
                   onOpen={closeAllMenus}
                 >
                   {sizeOptions.map((s) => (
                     <DropdownItem key={s} onClick={() => setSize(s)}>
                       {s}
                     </DropdownItem>
                   ))}
                 </Dropdown>
   
                 {/* 굵기 */}
                 <Dropdown
                   label="굵기"
                   show={showWeightMenu}
                   setShow={setShowWeightMenu}
                   onOpen={closeAllMenus}
                 >
                   {weightOptions.map((w) => (
                     <DropdownItem key={w} onClick={() => setWeight(w)}>
                       {w}
                     </DropdownItem>
                   ))}
                 </Dropdown>
   
                 {/* 색상 */}
                 <Dropdown
                   label="색상"
                   show={showColorMenu}
                   setShow={setShowColorMenu}
                   onOpen={closeAllMenus}
                 >
                   <div className="flex flex-wrap gap-2 p-1">
                     {colorPalette.map((c) => (
                       <div
                         key={c.value}
                         className="w-6 h-6 rounded border cursor-pointer"
                         style={{ backgroundColor: c.value }}
                         onClick={() => setColor(c.value)}
                       />
                     ))}
                   </div>
                 </Dropdown>
   
                 {/* PC 정렬 */}
                 <Dropdown
                   label="PC 정렬"
                   show={showPCAlignMenu}
                   setShow={setShowPCAlignMenu}
                   onOpen={closeAllMenus}
                 >
                   {(["left", "center", "right"] as const).map((pos) => (
                     <DropdownItem
                       key={pos}
                       icon={
                         pos === "left"
                           ? Bars3BottomLeftIcon
                           : pos === "center"
                           ? Bars3Icon
                           : Bars3BottomRightIcon
                       }
                       onClick={() => {
                         setTextDAlign(pos);
                         setPcAlign(pos);
                       }}
                     >
                       {pos}
                     </DropdownItem>
                   ))}
                 </Dropdown>
   
                 {/* MOBILE 정렬 */}
                 <Dropdown
                   label="MOBILE 정렬"
                   show={showMobileAlignMenu}
                   setShow={setShowMobileAlignMenu}
                   onOpen={closeAllMenus}
                 >
                   {(["left", "center", "right"] as const).map((pos) => (
                     <DropdownItem
                       key={pos}
                       icon={
                         pos === "left"
                           ? Bars3BottomLeftIcon
                           : pos === "center"
                           ? Bars3Icon
                           : Bars3BottomRightIcon
                       }
                       onClick={() => {
                         setTextMAlign(pos);
                         setMobAlign(pos);
                       }}
                     >
                       {pos}
                     </DropdownItem>
                   ))}
                 </Dropdown>
   
                 {/* 이미지 업로드 */}
                 <button
                   type="button"
                   className="px-3 py-1 bg-white border rounded flex items-center hover:bg-gray-50"
                   onClick={() => fileInputRef.current?.click()}
                 >
                   이미지 <PhotoIcon className="w-4 h-4 ml-1" />
                 </button>
   
                 {/* 그룹 묶기 */}
                 <button
                   type="button"
                   className="px-3 py-1 bg-white border rounded flex items-center hover:bg-gray-50"
                   onClick={() => editor?.chain().focus().wrapImages().run()}
                 >
                   그룹으로 묶기
                 </button>
               </div>
   
               {/* 파일 input */}
               <input
                 type="file"
                 accept="image/*"
                 multiple
                 ref={fileInputRef}
                 className="hidden"
                 onChange={async (e) => {
                   const files = Array.from(e.target.files ?? []);
                   for (const f of files) {
                     const url = await uploadFile(f);
                     editor?.chain().focus().setImage({ src: url, alt: "" }).wrapImages().run();
                   }
                   e.target.value = "";
                 }}
               />
   
               {/* 에디터 */}
               <EditorContent editor={editor} className="ProseMirror border p-2 min-h-[120px]" />
             </div>
           )}
   
           {/* ---- HEADER / IMAGE / CAROUSEL ---- */}
           {widgetType === "header" && (
             <div className="space-y-1">
               <label className="block font-medium">배경 이미지 업로드</label>
               <ImageUploadForm onUploaded={handleImageUploaded} />
               {renderHeaderPreview()}
             </div>
           )}
           {widgetType === "image" && <div className="mt-2 space-y-2" />}
           {widgetType === "carousel" && renderCarouselPreview()}
           {widgetType === "fadeCarousel" && renderFadeCarouselPreview()}
           {widgetType === "button" && <div className="mt-2 space-y-2" />}
   
           <button type="submit" className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600">
             생성
           </button>
         </form>
       </div>
     );
   }
   
   /* =====================================================================
      서브 컴포넌트: Dropdown & DropdownItem
   =====================================================================*/
   interface DropdownProps {
     label: string;
     show: boolean;
     setShow: React.Dispatch<React.SetStateAction<boolean>>;
     onOpen: () => void;
     children: React.ReactNode;
   }
   function Dropdown({ label, show, setShow, onOpen, children }: DropdownProps) {
     return (
       <div className="relative">
         <button
           type="button"
           className="px-3 py-1 bg-white border rounded flex items-center hover:bg-gray-50"
           onClick={() => {
             onOpen();
             setShow(true);
           }}
         >
           {label} <ChevronDownIcon className="w-4 h-4 ml-1" />
         </button>
         {show && (
           <div className="absolute z-10 bg-white border rounded mt-1 p-2 shadow-sm">{children}</div>
         )}
       </div>
     );
   }
   
   interface DropdownItemProps {
     icon?: React.ComponentType<{ className?: string }>;
     onClick: () => void;
     children: React.ReactNode;
   }
   function DropdownItem({ icon: Icon, onClick, children }: DropdownItemProps) {
     return (
       <div
         className="px-2 py-1 hover:bg-gray-100 cursor-pointer flex items-center"
         onClick={() => {
           onClick();
         }}
       >
         {Icon && <Icon className="w-4 h-4 mr-1" />}
         {children}
       </div>
     );
   }
   