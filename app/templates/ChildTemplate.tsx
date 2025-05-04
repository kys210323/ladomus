"use client";

import React from "react";
import DOMPurify from "isomorphic-dompurify";

/* ===== 페이지·위젯 타입 ===== */
export interface ChildPageData {
  id: number;
  title: string;
  slug: string;
  content: string;
  template?: string;
}

export interface ChildWidgetData {
  id: number;
  widget_type: "text" | "image" | "header" | "carousel" | "fadeCarousel" | "button";
  data: any;
  sort_order: number;
}

interface ChildTemplateProps {
  page: ChildPageData;
  widgets?: ChildWidgetData[];
  children?: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/* (A) 썸네일+화살표 캐러셀                                           */
/* ------------------------------------------------------------------ */
function CarouselWidget({
  images,
  autoplay,
  delay,
}: {
  images: { src: string }[];
  autoplay?: boolean;
  delay?: number;
}) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isAuto, setIsAuto] = React.useState(autoplay || false);
  const len = images.length;
  const interval = delay || 3000;

  React.useEffect(() => {
    if (!isAuto || len === 0) return;
    const t = setInterval(() => setCurrentIndex((p) => (p + 1) % len), interval);
    return () => clearInterval(t);
  }, [isAuto, len, interval]);

  if (!len) return <div className="text-gray-500">캐러셀 이미지 없음</div>;

  const prev = () => setCurrentIndex((p) => (p === 0 ? len - 1 : p - 1));
  const next = () => setCurrentIndex((p) => (p + 1) % len);
  const to = (i: number) => {
    setIsAuto(false);
    setCurrentIndex(i);
  };

  return (
    <div className="mb-8">
      <div className="relative w-full max-w-[1280px] mx-auto aspect-[4/3] overflow-hidden my-4">
        {images.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt={`carousel-${i}`}
            onClick={() => setIsAuto(false)}
            className={`
              absolute inset-0 w-full h-full object-cover duration-500
              ${i === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"}
            `}
          />
        ))}
        <button onClick={prev}  className="absolute top-1/2 left-6 -translate-y-1/2 text-white z-20 opacity-50 hover:opacity-100">◀</button>
        <button onClick={next}  className="absolute top-1/2 right-6 -translate-y-1/2 text-white z-20 opacity-50 hover:opacity-100">▶</button>
      </div>

      <div className="w-full max-w-[1280px] mx-auto p-2 flex gap-2 overflow-x-auto justify-center bg-stone-500">
        {images.map((img, i) => (
          <div key={i} onClick={() => to(i)}
               className={`min-w-[64px] h-[48px] border-2 ${i === currentIndex ? "border-blue-500" : "border-transparent"}`}>
            <img src={img.src} alt={`thumb-${i}`} className="w-full h-full object-cover"/>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* (B) 페이드 캐러셀                                                 */
/* ------------------------------------------------------------------ */
function FadeCarouselWidget({ images, aspect }: { images: { src: string }[]; aspect?: string }) {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    if (!images.length) return;
    const t = setInterval(() => setIdx((p) => (p + 1) % images.length), 2000);
    return () => clearInterval(t);
  }, [images]);

  if (!images.length) return <div className="text-gray-500">페이드 캐러셀 이미지 없음</div>;

  const ratio = aspect || "16/9";
  return (
    <div className="relative w-full max-w-[800px] mx-auto overflow-hidden my-4" style={{ aspectRatio: ratio }}>
      {images.map((img, i) => (
        <img key={i} src={img.src} alt={`fade-${i}`}
             className={`absolute inset-0 w-full h-full object-cover duration-500 ${i === idx ? "opacity-100" : "opacity-0"}`}/>
      ))}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {images.map((_, i) => (
          <div key={i}
               onClick={() => setIdx(i)}
               className={`w-2 h-2 rounded-full bg-white cursor-pointer ${i === idx ? "opacity-100" : "opacity-50"}`} />
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*                       ChildTemplate Component                       */
/* ================================================================== */
export default function ChildTemplate({ page, widgets, children }: ChildTemplateProps) {
  const sorted = [...(widgets || [])].sort((a, b) => a.sort_order - b.sort_order);

  /* groupId 로 묶기 */
  const groups: Record<string, ChildWidgetData[]> = {};
  sorted.forEach((w) => {
    const key = String(w.data?.groupId || 0);
    (groups[key] ||= []).push(w);
  });

  /* ---------------- 렌더 ---------------- */
  return (
    <div className="w-full flex justify-center">
      <div className="max-w-[1280px] w-full px-4 py-5">

        {Object.entries(groups).map(([gid, gw]) =>
          gid === "0" ? (
            /* 단독 위젯 */
            gw.map((w) => <div key={w.id} className="my-8">{renderWidget(w)}</div>)
          ) : (
            /* 그룹 위젯 */
            <div key={gid} className="flex flex-col xl:flex-row items-start xl:items-center gap-12 my-8">
              {gw.map((w) => (
                <div key={w.id} className="w-full xl:flex-1 min-w-0">{renderWidget(w)}</div>
              ))}
            </div>
          )
        )}

        {/* children slot */}
        {children}
      </div>
    </div>
  );

  /* ---------------- 위젯 렌더 함수 ---------------- */
  function renderWidget(w: ChildWidgetData) {
    switch (w.widget_type) {
      /* TEXT 위젯 -------------------------------------------------- */
      case "text": {
        const {
          content = "",
          color = "text-black",
          size = "1rem",
          font = "Times New Roman",
          weight = "400",
          mAlign = "left",
          dAlign = "left",
        } = w.data || {};

        const alignClass = combineAlignClassesImportant(mAlign, dAlign);

        return (
          <div
            className={`my-2 leading-relaxed ${color} ${alignClass}`}
            style={{
              textAlign: dAlign,
              fontSize: size,
              fontFamily: font,
              fontWeight: weight as React.CSSProperties["fontWeight"],
            }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
          />
        );
      }

      /* IMAGE ------------------------------------------------------ */
      case "image": {
        const { src = "", alt = "", size = "original", align = "left" } = w.data || {};
        const sizeClass = size === "medium" ? "max-w-[600px]" : size === "fullwidth" ? "w-full" : "";
        const alignStyle =
          align === "center" ? { margin: "0 auto" } :
          align === "right"  ? { marginLeft: "auto", marginRight: 0 } : {};

        return (
          <div className="my-2">
            <img src={src} alt={alt} className={`${sizeClass} h-auto block`} style={alignStyle}/>
          </div>
        );
      }

      /* HEADER ----------------------------------------------------- */
      case "header":
        return (
          <div className="my-2 w-full">
            <img src={w.data?.bg || ""} alt="header" className="w-full h-auto object-cover" />
          </div>
        );

      /* CAROUSEL --------------------------------------------------- */
      case "carousel":
        return (
          <div className="w-full my-2">
            <CarouselWidget images={w.data?.images || []} autoplay={w.data?.autoplay} delay={w.data?.delay} />
          </div>
        );

      /* FADE CAROUSEL --------------------------------------------- */
      case "fadeCarousel":
        return (
          <div className="w-full my-2">
            <FadeCarouselWidget images={w.data?.images || []} aspect={w.data?.aspect || "16/9"} />
          </div>
        );

      /* BUTTON ----------------------------------------------------- */
      case "button": {
        const { text = "버튼", size = "normal", weight = "400", url = "#", target = "_self" } = w.data || {};
        const btnClass =
          size === "small" ? "px-2 py-1 text-sm" :
          size === "large" ? "px-4 py-2 text-lg" :
          size === "full"  ? "w-full py-2 text-md" : "px-3 py-1";

        return (
          <div className="my-2">
            <a href={url} target={target} rel="noopener noreferrer"
               className={`inline-block bg-blue-600 text-white rounded hover:bg-blue-700 transition ${btnClass}`}
               style={{ fontWeight: weight as React.CSSProperties["fontWeight"] }}>
              {text}
            </a>
          </div>
        );
      }

      /* UNKNOWN ---------------------------------------------------- */
      default:
        return (
          <div className="my-2 text-gray-500">
            알 수 없는 위젯: {w.widget_type}
            <br />{JSON.stringify(w.data)}
          </div>
        );
    }
  }

  /* --- Tailwind !important align helper ------------------------- */
  function combineAlignClassesImportant(m: string, d: string) {
    const imp = (a: string) =>
      a === "center" ? "!text-center" : a === "right" ? "!text-right" : "!text-left";
    return `${imp(m)} xl:${imp(d)}`;
  }
}
