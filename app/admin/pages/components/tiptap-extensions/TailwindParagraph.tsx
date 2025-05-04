// app/admin/pages/components/tiptap-extensions/TailwindParagraph.ts
import { Node } from "@tiptap/core";

/* ────────────────────────────────────────────────────────────────
   Declaration Merging – 새로운 명령(setPcAlign, setMobileAlign) 추가
──────────────────────────────────────────────────────────────── */
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    tailwindParagraph: {
      /** PC + Mobile 정렬을 한 번에 지정 */
      setTailwindAlign: (
        pc: "left" | "center" | "right",
        mobile: "left" | "center" | "right"
      ) => ReturnType;

      /** PC 정렬만 개별 업데이트 */
      setPcAlign: (pc: "left" | "center" | "right") => ReturnType;

      /** Mobile 정렬만 개별 업데이트 */
      setMobileAlign: (mobile: "left" | "center" | "right") => ReturnType;
    };
  }
}

/* ────────────────────────────────────────────────────────────────
   TailwindParagraph – p 태그용 커스텀 노드
──────────────────────────────────────────────────────────────── */
export const TailwindParagraph = Node.create({
  name: "paragraph",
  group: "block",
  content: "inline*",

  /* 문서 노드가 보유할 attribute (HTML 출력 X) */
  addAttributes() {
    return {
      pcAlign: { default: "left" },
      mobileAlign: { default: "left" },
    } as const;
  },

  /* ----------------------------------------------------------------
     parseHTML – HTML→문서 노드 변환 시 Tailwind 클래스를 역‑매핑
  ---------------------------------------------------------------- */
  parseHTML() {
    return [
      {
        tag: "p",
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) return {};

          const cls = node.className.split(/\s+/);

          // 모바일 기본(text-*)
          let mobile: "left" | "center" | "right" = "left";
          if (cls.includes("text-center")) mobile = "center";
          else if (cls.includes("text-right")) mobile = "right";

          // PC 변형(md:text-*)
          let pc: "left" | "center" | "right" = "left";
          if (cls.includes("md:text-center")) pc = "center";
          else if (cls.includes("md:text-right")) pc = "right";

          return { pcAlign: pc, mobileAlign: mobile };
        },
      },
    ];
  },

  /* ----------------------------------------------------------------
     renderHTML – 문서 노드→HTML 출력 (Tailwind 클래스로 변환)
  ---------------------------------------------------------------- */
  renderHTML({ node }) {
    const pc = (node.attrs.pcAlign ?? "left") as "left" | "center" | "right";
    const mob = (node.attrs.mobileAlign ?? "left") as "left" | "center" | "right";
    return ["p", { class: `text-${mob} md:text-${pc}` }, 0];
  },

  /* ----------------------------------------------------------------
     addCommands – 에디터 명령 정의
  ---------------------------------------------------------------- */
  addCommands() {
    return {
      /** PC + Mobile 동시 지정 */
      setTailwindAlign:
        (pc: "left" | "center" | "right", mobile: "left" | "center" | "right") =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { pcAlign: pc, mobileAlign: mobile }),

      /** PC 정렬만 */
      setPcAlign:
        (pc: "left" | "center" | "right") =>
        ({ commands }) => commands.updateAttributes(this.name, { pcAlign: pc }),

      /** Mobile 정렬만 */
      setMobileAlign:
        (mobile: "left" | "center" | "right") =>
        ({ commands }) => commands.updateAttributes(this.name, { mobileAlign: mobile }),
    };
  },
});
