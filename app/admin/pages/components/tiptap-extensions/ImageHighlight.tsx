// app/admin/pages/components/tiptap-extensions/ImageHighlight.ts
import { Plugin, PluginKey }   from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { findChildren } from "@tiptap/core";   // tiptap util

/** outline 스타일은 Tailwind 등으로 .img-outline 클래스에 지정 */
const OUTLINE_CLASS = "img-outline";

export const ImageHighlight = new Plugin({
  key: new PluginKey("imageHighlight"),

  /* ─ state field ─────────────────────────────────────────── */
  state: {
    init: (_: any, { doc, selection }) => getDecos(doc, selection),
    apply(tr, oldDecos) {
      if (!tr.docChanged && !tr.selectionSet) return oldDecos;
      return getDecos(tr.doc, tr.selection);
    },
  },

  /* ─ prop: 실제 뷰에 데코 연결 ───────────────────────────── */
  props: {
    decorations: (state) => (this as any).getState(state),
  },
});

/* 도우미 – 선택 범위 안의 이미지마다 Decoration 만들기 */
function getDecos(doc: any, sel: any): DecorationSet {
  const { from, to } = sel;
  const decos: Decoration[] = [];

  doc.nodesBetween(from, to, (node: any, pos: number) => {
    if (node.type.name === "image") {
      decos.push(
        Decoration.node(pos, pos + node.nodeSize, { class: OUTLINE_CLASS })
      );
    }
  });

  return DecorationSet.create(doc, decos);
}
