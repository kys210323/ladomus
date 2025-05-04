/* ------------------------------------------------------------------
   TailwindImage – NodeView (선택 시 툴바 표시)
------------------------------------------------------------------ */
import { Node, mergeAttributes, ReactNodeViewRenderer } from "@tiptap/react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import {
  ArrowsPointingOutIcon,       // 풀-화면 (full-width)
  ArrowsPointingInIcon,        // 원본 너비
  TrashIcon,
} from "@heroicons/react/20/solid";
import clsx from "clsx";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    tailwindImage: {
      toggleFull: () => ReturnType
      deleteImage: () => ReturnType
    }
  }
}

/* ---------- React NodeView 컴포넌트 ---------- */
const ImageComponent: React.FC<{
  node: any;
  updateAttributes: (attrs: any) => void;
  selected: boolean;
}> = ({ node, updateAttributes, selected }) => {
  const { src, full } = node.attrs;

  return (
    <NodeViewWrapper className="relative my-4 flex justify-center">
      {/* 이미지 */}
      <img
        src={src}
        className={clsx(
          "mx-auto rounded",
          full ? "w-full" : "max-w-[600px]"
        )}
        draggable={false}
      />

      {/* 선택됐을 때 보이는 오버레이 툴바 */}
      {selected && (
        <div className="absolute -top-2 right-2 flex gap-1 bg-white/90 rounded shadow p-1">
          <button
            className="p-1 hover:bg-gray-200 rounded"
            onClick={() => updateAttributes({ full: !full })}
            title={full ? "원본 너비" : "전체 너비"}
          >
            {full ? (
              <ArrowsPointingInIcon className="w-4 h-4" />
            ) : (
              <ArrowsPointingOutIcon className="w-4 h-4" />
            )}
          </button>
          <button
            className="p-1 hover:bg-red-100 rounded"
            onClick={() => updateAttributes({ src: null })} // 커맨드 대신 attr 삭제
            title="삭제"
          >
            <TrashIcon className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}
    </NodeViewWrapper>
  );
};

/* ---------- Tiptap Extension ---------- */
export const TailwindImage = Node.create({
  name: "tailwindImage",
  group: "block",
  inline: false,
  selectable: true,
  draggable: true,
  atom: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      src: { default: null },
      full: { default: false }, // full-width 여부
      alt: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "img[data-tailwind-image]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-tailwind-image": "true",
        class: clsx(
          "mx-auto rounded",
          HTMLAttributes.full ? "w-full" : "max-w-full"
        ),
      }),
    ];
  },

  addCommands() {
    return {
      toggleFull:
        () =>
        ({ commands }) =>
          commands.updateAttributes(this.name, (attrs: any) => ({
            full: !attrs.full,
          })),

      deleteImage:
        () =>
        ({ commands }) =>
          commands.deleteSelection(),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent);
  },
});
