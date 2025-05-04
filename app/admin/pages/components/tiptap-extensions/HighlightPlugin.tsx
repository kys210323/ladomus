/* =========================================================================
   HighlightPlugin – 선택(Selection) 영역 하이라이트 플러그인
   =========================================================================*/
   import { Extension } from "@tiptap/core";
   import { Plugin, PluginKey } from "prosemirror-state";
   import { Decoration, DecorationSet } from "prosemirror-view";
   
   const PLUGIN_KEY = new PluginKey("highlightPlugin");
   
   export const HighlightPlugin = Extension.create({
     name: "highlightPlugin",
   
     addProseMirrorPlugins() {
       return [
         new Plugin({
           key: PLUGIN_KEY,
   
           state: {
             init: () => DecorationSet.empty,
             apply(tr, old) {
               // selection 이 바뀌지 않았으면 기존 데코레이션 유지
               if (!tr.selectionSet) return old;
   
               const { from, to } = tr.selection;
               if (from === to) return DecorationSet.empty; // 커서만 깜빡일 때는 표시 X
   
               const deco = Decoration.inline(from, to, {
                 class: "tiptap-selection-highlight",
               });
               return DecorationSet.create(tr.doc, [deco]);
             },
           },
   
           props: {
             decorations(state) {
               return (this as any).getState(state);
             },
           },
         }),
       ];
     },
   });
   