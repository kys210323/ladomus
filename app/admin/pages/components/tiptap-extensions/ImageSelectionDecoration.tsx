/* =========================================================================
   ImageSelectionDecoration – 선택된 <img> 노드들에 파란 outline 부여
   =========================================================================*/
   import { Extension } from "@tiptap/core";
   import { Plugin, PluginKey } from "prosemirror-state";
   import { Decoration, DecorationSet } from "prosemirror-view";
   
   export const ImageSelectionDecoration = Extension.create({
     name: "imageSelectionDecoration",
   
     addProseMirrorPlugins() {
       const key = new PluginKey("image-selection-decoration");
   
       return [
         new Plugin({
           key,
   
           /* ------------------------------------------------------------
              pluginState: selection | doc 변화 시 이미지 노드들 데코 계산
           ------------------------------------------------------------ */
           state: {
             init: () => DecorationSet.empty,
   
             apply(tr, oldDecos, _oldState, newState) {
               // selection 변경 또는 doc 변경이 없으면 기존 데코 매핑
               if (!tr.selectionSet && !tr.docChanged) {
                 return oldDecos.map(tr.mapping, tr.doc);
               }
   
               const { from, to } = tr.selection;
               const decos: Decoration[] = [];
   
               newState.doc.nodesBetween(from, to, (node, pos) => {
                 if (node.type.name === "image") {
                   decos.push(
                     Decoration.node(
                       pos,
                       pos + node.nodeSize,
                       {
                         class: "selected-image", // Tailwind / CSS 에 스타일 지정
                       },
                       { key: "img-selection" }
                     )
                   );
                 }
               });
   
               return DecorationSet.create(newState.doc, decos);
             },
           },
   
           /* ------------------------------------------------------------
              editor.props: 위에서 계산한 DecorationSet 주입
           ------------------------------------------------------------ */
           props: {
             decorations(state) {
               return key.getState(state) as DecorationSet;
             },
           },
         }),
       ];
     },
   });
   