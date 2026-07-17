"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";

import { cn } from "@/lib/utils";

type ToolbarButtonKey =
  | "underline"
  | "bold"
  | "italic"
  | "align-left"
  | "align-center"
  | "align-right"
  | "align-justify"
  | "ordered-list"
  | "bullet-list";

const toolbarButtons: Array<{
  key: ToolbarButtonKey;
  icon: ReactNode;
}> = [
  { key: "underline", icon: <Underline className="size-4" /> },
  { key: "bold", icon: <Bold className="size-4" /> },
  { key: "italic", icon: <Italic className="size-4" /> },
  { key: "align-left", icon: <AlignLeft className="size-4" /> },
  { key: "align-center", icon: <AlignCenter className="size-4" /> },
  { key: "align-right", icon: <AlignRight className="size-4" /> },
  { key: "align-justify", icon: <AlignJustify className="size-4" /> },
  { key: "ordered-list", icon: <ListOrdered className="size-4" /> },
  { key: "bullet-list", icon: <List className="size-4" /> },
];

const toolbarActions: Record<ToolbarButtonKey, string> = {
  underline: "underline",
  bold: "bold",
  italic: "italic",
  "align-left": "justifyLeft",
  "align-center": "justifyCenter",
  "align-right": "justifyRight",
  "align-justify": "justifyFull",
  "ordered-list": "insertOrderedList",
  "bullet-list": "insertUnorderedList",
};

type RichTextComposerProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string | boolean;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
};

function hasVisibleContent(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim().length > 0;
}

const RichTextComposer = ({
  value,
  onChange,
  error,
  placeholder = "Write your message...",
  readOnly = false,
  className,
}: RichTextComposerProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const [fontSize, setFontSize] = useState("16");

  const syncContent = () => {
    onChange?.(editorRef.current?.innerHTML || "");
  };

  const saveSelection = () => {
    const selection = window.getSelection();

    if (
      selection &&
      selection.rangeCount > 0 &&
      editorRef.current?.contains(selection.anchorNode)
    ) {
      savedSelectionRef.current = selection.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();

    if (selection && savedSelectionRef.current) {
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
    }
  };

  const applyCommand = (
    command: string,
    commandValue?: string | null,
  ) => {
    if (!editorRef.current || readOnly) return;

    editorRef.current.focus();
    restoreSelection();
    document.execCommand(command, false, commandValue ?? undefined);
    saveSelection();
    syncContent();
  };

  const applyFontSize = (size: string) => {
    if (!editorRef.current || readOnly) return;

    setFontSize(size);
    editorRef.current.focus();
    restoreSelection();
    document.execCommand("fontSize", false, "7");

    editorRef.current.querySelectorAll('font[size="7"]').forEach((node) => {
      node.removeAttribute("size");
      (node as HTMLElement).style.fontSize = `${size}px`;
    });

    saveSelection();
    syncContent();
  };

  useEffect(() => {
    if (!editorRef.current) return;

    if (editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-[#D9D9D9] bg-white",
        error && "border-red-400",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-[#E5E7EB] bg-white px-3 py-2">
        <select
          value={fontSize}
          onChange={(event) => applyFontSize(event.target.value)}
          className="h-8 rounded-md border border-[#E5E7EB] px-2 text-sm text-[#4A4A4A] outline-none"
          aria-label="Font size"
          disabled={readOnly}
        >
          <option value="12">12</option>
          <option value="14">14</option>
          <option value="16">16</option>
          <option value="18">18</option>
          <option value="20">20</option>
          <option value="24">24</option>
        </select>

        <div className="h-5 w-px bg-[#E5E7EB]" />

        {toolbarButtons.map(({ key, icon }) => (
          <button
            key={key}
            type="button"
            disabled={readOnly}
            onMouseDown={(event) => {
              event.preventDefault();
              applyCommand(toolbarActions[key]);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#4A4A4A] hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={key}
            title={key}
          >
            {icon}
          </button>
        ))}
      </div>

      <div className="relative bg-white">
        {!hasVisibleContent(value) ? (
          <span className="pointer-events-none absolute left-4 top-4 text-[15px] text-[#A1A1AD]">
            {placeholder}
          </span>
        ) : null}

        <div
          ref={editorRef}
          contentEditable={!readOnly}
          suppressContentEditableWarning
          onInput={syncContent}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          onFocus={saveSelection}
          onBlur={saveSelection}
          className={cn(
            "min-h-[250px] bg-white px-4 py-4 text-base text-[#222222] outline-none",
            "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1",
            readOnly && "cursor-default bg-[#F8F7FC] text-[#434343]",
          )}
          style={{ fontSize: "16px" }}
        />
      </div>
    </div>
  );
};

export default RichTextComposer;
