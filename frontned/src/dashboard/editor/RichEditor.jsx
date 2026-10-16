

import React, { useMemo, useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { API, authFetch } from "../config";

export default function RichEditor({
  value,
  onChange,
  height = 560,
}) {
  const quillRef = useRef(null);

  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append("image", file, file.name);

    const res = await authFetch(`${API}/upload`, {
      method: "POST",
      body: fd,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.url) {
      throw new Error(
        data.error || "Image upload fail ho gaya."
      );
    }

    return data.url;
  };


  const handleImageUpload = () => {
    const input = document.createElement("input");

    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const imageUrl = await uploadImage(file);

        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        const range = editor.getSelection(true);
        const index = range ? range.index : editor.getLength();

        editor.insertEmbed(index, "image", imageUrl, "user");
        editor.setSelection(index + 1, 0, "user");
      } catch (error) {
        console.error("Image upload error:", error);
        window.alert(
          error.message || "Image upload fail ho gaya."
        );
      }
    };
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, 4, false] }],
          ["bold", "italic", "underline", "strike"],
          [
            { color: [] },
            { background: [] },
          ],
          [{ align: [] }],
          [
            { list: "ordered" },
            { list: "bullet" },
          ],
          [
            { indent: "-1" },
            { indent: "+1" },
          ],
          ["blockquote", "code-block"],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: handleImageUpload,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "align",
    "list",
    "indent",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
  ];

  return (
    <div className="rich-editor overflow-hidden rounded-xl border border-orange-200 bg-white">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={modules}
        formats={formats}
        style={{ height }}
        placeholder="Write your article content here..."
      />

      <style>{`
        .rich-editor .ql-toolbar.ql-snow {
          border: 0;
          border-bottom: 1px solid #fed7aa;
          padding: 12px 14px;
          background: #fff;
        }

        .rich-editor .ql-toolbar .ql-formats {
          margin-right: 14px;
        }

        .rich-editor .ql-container.ql-snow {
          border: 0;
          font-family: Inter, system-ui, sans-serif;
          font-size: 15px;
          color: #1e293b;
        }

        .rich-editor .ql-editor {
          min-height: 100%;
          line-height: 1.8;
          padding: 20px 24px;
          overflow-wrap: anywhere;
        }

        .rich-editor .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
          left: 24px;
          right: 24px;
        }

        .rich-editor .ql-editor h2,
        .rich-editor .ql-editor h3,
        .rich-editor .ql-editor h4 {
          color: #0f172a;
          font-weight: 700;
          margin-top: 24px;
          margin-bottom: 12px;
        }

        .rich-editor .ql-editor a {
          color: #ea580c;
        }

        .rich-editor .ql-editor img {
          max-width: 100%;
          height: auto;
        }

        .rich-editor .ql-toolbar button:hover,
        .rich-editor .ql-toolbar button.ql-active {
          color: #ea580c;
        }

        .rich-editor .ql-toolbar button:hover .ql-stroke,
        .rich-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: #ea580c;
        }

        .rich-editor .ql-toolbar button:hover .ql-fill,
        .rich-editor .ql-toolbar button.ql-active .ql-fill {
          fill: #ea580c;
        }
      `}</style>
    </div>
  );
}
