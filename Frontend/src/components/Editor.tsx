"use client";
// import dynamic from "next/dynamic";

// const MonacoEditor = dynamic(import("@monaco-editor/react"), { ssr: false });

const EditorComponent = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  console.log(value, onChange);
  return (
    <div style={{ height: "100vh" }}>
      {/* <MonacoEditor
        height="100%"
        language="javascript"
        theme="vs-dark"
        value={value}
        onChange={onChange}
        options={{
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          cursorStyle: "line",
          automaticLayout: true,
        }}
      /> */}
    </div>
  );
};

export default EditorComponent;
