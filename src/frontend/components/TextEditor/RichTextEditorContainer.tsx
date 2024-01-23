import React, { useState } from "react";
import RichTextEditor from "react-rte";

const RichTextEditorContainer = () => {
  const [value, setValue] = useState(RichTextEditor.createEmptyValue());
  return (
    <RichTextEditor
      className="w-full text-sm leading-[17px] !bg-neutral-800 !mt-3 mb-[10px] !border !border-neutral-700 !rounded-xl h-[230px] !overflow-y-scroll"
      value={value}
      onChange={(value) => {
        setValue(value);
        console.log(value.toString("html"));
      }}
    />
  );
};

export default RichTextEditorContainer;
