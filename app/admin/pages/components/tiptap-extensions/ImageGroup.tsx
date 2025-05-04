/* =========================================================================
   app/admin/pages/components/tiptap-extensions/ImageGroup.tsx
   =========================================================================*/
   import {
    Node,
    mergeAttributes,
    Command,
    findChildren,
  } from "@tiptap/core";
  
  import {
    ReactNodeViewRenderer,
    NodeViewWrapper,
    NodeViewContent,
  } from "@tiptap/react";       // ← 경로 수정!  (@tiptap/core → @tiptap/react)
  
  import { EditorState, Transaction } from "prosemirror-state";
  import { Node as PMNode } from "prosemirror-model";
  
  /* ------------------------------------------------------------------
     이하 코드는 이전에 드린 내용과 **동일** — 변경된 것은 import 부분뿐입니다.
  -------------------------------------------------------------------*/
  export interface ImageGroupOptions {
    max: number;
  }
  
  declare module "@tiptap/core" {
    interface Commands<ReturnType> {
      imageGroup: {
        wrapImages: () => ReturnType;
      };
    }
  }
  
  const ImageGroupView: React.FC = () => (
    <NodeViewWrapper
      as="div"
      className="not-prose flex gap-2 my-2 justify-center"
      style={{ width: "100%" }}
      data-type="image-group"
    >
      <NodeViewContent as="div" className="flex gap-2 w-full justify-center" />
    </NodeViewWrapper>
  );
  
  export const ImageGroup = Node.create<ImageGroupOptions>({
    name: "imageGroup",
    group: "block",
    content: "image{2,3}",
    isolating: true,
    draggable: true,
  
    addOptions() {
      return { max: 3 };
    },
  
    parseHTML() {
      return [{ tag: 'div[data-type="image-group"]' }];
    },
  
    renderHTML({ HTMLAttributes }) {
      return ["div", mergeAttributes(HTMLAttributes, { "data-type": "image-group" }), 0];
    },
  
    addNodeView() {
      return ReactNodeViewRenderer(ImageGroupView);
    },
  
    addCommands() {
      return {
        wrapImages:
          () =>
          ({ state, dispatch }: { state: EditorState; dispatch?: (tr: Transaction) => void }) => {
            const { selection, schema } = state;
            const { from, to } = selection;
            const image = schema.nodes.image;
            const imageGroup = schema.nodes.imageGroup;
            if (!image || !imageGroup) return false;
  
            const imgs = findChildren(state.doc, (n) => n.type === image).filter(
              (ch) => ch.pos >= from && ch.pos + ch.node.nodeSize <= to,
            );
  
            if (imgs.length < 2 || imgs.length > (this.options.max ?? 3)) return false;
  
            const groupNode: PMNode = imageGroup.create(
              null,
              imgs.map((ch) => ch.node.copy()),
            );
  
            if (dispatch) {
              dispatch(
                state.tr
                  .delete(imgs[0].pos, imgs[imgs.length - 1].pos + imgs[imgs.length - 1].node.nodeSize)
                  .insert(imgs[0].pos, groupNode)
                  .scrollIntoView(),
              );
            }
            return true;
          },
      };
    },
  });
  