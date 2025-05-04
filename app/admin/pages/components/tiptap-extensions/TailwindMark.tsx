// app/admin/pages/components/tiptap/extensions/TailwindMark.ts
import { Mark, mergeAttributes } from "@tiptap/core";

/** 인라인 스타일 → Tailwind 클래스로 치환 */
export interface TailwindMarkAttrs {
  fontFamily?: string;  // ex) "Times New Roman"
  fontSize?: string;    // ex) "1.5rem"
  fontWeight?: string;  // ex) "700"
  textColor?: string;   // ex) "#ef4444"
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    tailwindMark: {
      /** 스타일 지정 */
      setTailwindMark: (attrs: TailwindMarkAttrs) => ReturnType;
      /** 스타일 해제 */
      unsetTailwindMark: () => ReturnType;
    };
  }
}

/* -------------------------------------------------------------------------- */
/*  (1) 매핑 테이블                                                           */
/* -------------------------------------------------------------------------- */
const fontSizeMap: Record<string, string> = {
  "1rem": "text-base",
  "1.2rem": "text-lg",
  "1.5rem": "text-xl",
  "2rem": "text-2xl",
};

const colorMap: Record<string, string> = {
  "#000000": "text-black",
  "#6b7280": "text-gray-500",
  "#ef4444": "text-red-500",
  "#3b82f6": "text-blue-500",
  "#22c55e": "text-green-500",
  "#9e896e": "text-beige-gold", // custom color (tailwind.config 내 정의)
};

const weightMap: Record<string, string> = {
  "100": "font-thin",
  "300": "font-light",
  "400": "font-normal",
  "500": "font-medium",
  "700": "font-bold",
  "900": "font-black",
};

// Tailwind 기본 글꼴 또는 커스텀 plugin 매핑 예시
const fontFamilyMap: Record<string, string> = {
  "Times New Roman": "font-serif",
  "Arial, sans-serif": "font-sans",
  "Roboto, sans-serif": "font-roboto",
};

/* -------------------------------------------------------------------------- */
/*  Mark 정의                                                                 */
/* -------------------------------------------------------------------------- */
export const TailwindMark = Mark.create({
  name: "tailwindMark",

  /* ------------------------------------------------------------------------ */
  /*  ① attribute 정의 (render: false → HTML로 저장하지 않음)                 */
  /* ------------------------------------------------------------------------ */
  addAttributes() {
    return {
      fontFamily: { default: null, render: false },
      fontSize: { default: null, render: false },
      fontWeight: { default: null, render: false },
      textColor: { default: null, render: false },
    };
  },

  /* ------------------------------------------------------------------------ */
  /*  ② HTML 파싱                                                             */
  /* ------------------------------------------------------------------------ */
  parseHTML() {
    return [{ tag: "span[data-tailwindmark]" }];
  },

  /* ------------------------------------------------------------------------ */
  /*  ③ HTML 렌더 (Tailwind class만 남김)                                     */
  /* ------------------------------------------------------------------------ */
  renderHTML({ mark, HTMLAttributes }) {
    const { fontFamily, fontSize, fontWeight, textColor } =
      mark.attrs as TailwindMarkAttrs;

    const classes: string[] = [];

    if (fontSize && fontSizeMap[fontSize]) classes.push(fontSizeMap[fontSize]);
    if (textColor && colorMap[textColor]) classes.push(colorMap[textColor]);
    if (fontWeight && weightMap[fontWeight]) classes.push(weightMap[fontWeight]);
    if (fontFamily && fontFamilyMap[fontFamily])
      classes.push(fontFamilyMap[fontFamily]);

    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-tailwindmark": "", // 파싱 기준
        class: classes.join(" "),
      }),
      0,
    ];
  },

  /* ------------------------------------------------------------------------ */
  /*  ④ Commands                                                              */
  /* ------------------------------------------------------------------------ */
  addCommands() {
    return {
      setTailwindMark:
        (attrs: TailwindMarkAttrs) =>
        ({ chain }) =>
          chain().setMark(this.name, attrs).run(),

      unsetTailwindMark:
        () =>
        ({ chain }) =>
          chain().unsetMark(this.name).run(),
    };
  },
});
