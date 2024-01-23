import dynamic from "next/dynamic";
import React from "react";

const RichTextEditor = dynamic(() => import("./RichTextEditorContainer"), {
  ssr: false,
});

const TextEditor = () => {
  return <RichTextEditor />;
};

export default TextEditor;
