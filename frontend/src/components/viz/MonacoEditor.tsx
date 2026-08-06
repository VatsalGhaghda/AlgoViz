/**
 * MonacoEditor — Phase 9.2 / 9.4 / 9.10
 *
 * Thin wrapper around @monaco-editor/react with:
 * - App-matching dark theme aligned to CSS design tokens
 * - `highlightLine(lineNo, style)` / `clearHighlights()` — line decoration handle
 * - `setErrorMarker(lineNo, message)` / `clearErrorMarker()` — Phase 9.10 red gutter marker
 * - Auto-scroll to the highlighted line
 * - Fully controlled value + onChange
 */

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";
import Editor from "@monaco-editor/react";
import type { editor as MonacoEditorNS, Range as MonacoRange } from "monaco-editor";

// ── Public imperative handle ─────────────────────────────────────────────────

export interface MonacoEditorHandle {
  highlightLine:    (lineNo: number, style: LineHighlightStyle) => void;
  clearHighlights:  () => void;
  /** Phase 9.10: places a red error marker in the gutter at lineNo. */
  setErrorMarker:   (lineNo: number, message: string) => void;
  /** Phase 9.10: removes all error markers. */
  clearErrorMarker: () => void;
}

export type LineHighlightStyle = "active" | "error" | "timeout";

// ── Component props ──────────────────────────────────────────────────────────

interface Props {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: string;
}

// ── Theme ────────────────────────────────────────────────────────────────────

const APP_THEME = "algovis-dark";

// MarkerSeverity constant values (numeric mirror of monaco's enum — avoids runtime import)
const MARKER_SEVERITY_ERROR = 8; // monaco.MarkerSeverity.Error

// ── Decoration CSS (injected once) ──────────────────────────────────────────

let cssInjected = false;
function injectCSS() {
  if (cssInjected) return;
  cssInjected = true;
  const s = document.createElement("style");
  s.textContent = `
    .monaco-line-active  { background:rgba(34,211,238,.08)  !important; border-left:2px solid #22d3ee !important; }
    .monaco-line-error   { background:rgba(244,63,94,.10)   !important; border-left:2px solid #f43f5e !important; }
    .monaco-line-timeout { background:rgba(251,191,36,.08)  !important; border-left:2px solid #fbbf24 !important; }
  `;
  document.head.appendChild(s);
}

// ── Component ────────────────────────────────────────────────────────────────

const ERROR_MARKER_OWNER = "python-execution-error";

export const MonacoEditor = forwardRef<MonacoEditorHandle, Props>(
  function MonacoEditor({ value, onChange, readOnly = false, height = "100%" }, ref) {
    const editorRef  = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null);
    const decorRef   = useRef<MonacoEditorNS.IEditorDecorationsCollection | null>(null);
    const RangeRef   = useRef<typeof MonacoRange | null>(null);
    // Keep a reference to the monaco namespace so we can call setModelMarkers
    const monacoRef  = useRef<typeof import("monaco-editor") | null>(null);

    // ── Imperative API ─────────────────────────────────────────────────────

    const highlightLine = useCallback((lineNo: number, style: LineHighlightStyle) => {
      const editor = editorRef.current;
      const Range  = RangeRef.current;
      if (!editor || !Range || lineNo <= 0) return;

      const cls =
        style === "error"   ? "monaco-line-error"   :
        style === "timeout" ? "monaco-line-timeout" :
                              "monaco-line-active";

      decorRef.current?.clear();
      decorRef.current = editor.createDecorationsCollection([{
        range:   new Range(lineNo, 1, lineNo, 1) as unknown as import("monaco-editor").Range,
        options: { isWholeLine: true, className: cls },
      }]);
      editor.revealLineInCenterIfOutsideViewport(lineNo);
    }, []);

    const clearHighlights = useCallback(() => {
      decorRef.current?.clear();
    }, []);

    // Phase 9.10: gutter marker (red squiggle + gutter icon)
    const setErrorMarker = useCallback((lineNo: number, message: string) => {
      const monaco = monacoRef.current;
      const editor = editorRef.current;
      if (!monaco || !editor || lineNo <= 0) return;
      const model = editor.getModel();
      if (!model) return;
      monaco.editor.setModelMarkers(model, ERROR_MARKER_OWNER, [{
        startLineNumber: lineNo,
        startColumn:     1,
        endLineNumber:   lineNo,
        endColumn:       model.getLineMaxColumn(lineNo),
        message,
        severity:        MARKER_SEVERITY_ERROR,
      }]);
    }, []);

    const clearErrorMarker = useCallback(() => {
      const monaco = monacoRef.current;
      const editor = editorRef.current;
      if (!monaco || !editor) return;
      const model = editor.getModel();
      if (!model) return;
      monaco.editor.setModelMarkers(model, ERROR_MARKER_OWNER, []);
    }, []);

    useImperativeHandle(ref, () => ({
      highlightLine,
      clearHighlights,
      setErrorMarker,
      clearErrorMarker,
    }), [highlightLine, clearHighlights, setErrorMarker, clearErrorMarker]);

    // ── Mount ──────────────────────────────────────────────────────────────

    const handleMount = useCallback(
      (editor: MonacoEditorNS.IStandaloneCodeEditor, monaco: typeof import("monaco-editor")) => {
        editorRef.current = editor;
        RangeRef.current  = monaco.Range as unknown as typeof MonacoRange;
        monacoRef.current = monaco;

        monaco.editor.defineTheme(APP_THEME, {
          base: "vs-dark",
          inherit: true,
          rules: [
            { token: "keyword",         foreground: "c084fc" },
            { token: "string",          foreground: "86efac" },
            { token: "comment",         foreground: "6b7280" },
            { token: "number",          foreground: "67e8f9" },
            { token: "identifier",      foreground: "e2e8f0" },
            { token: "delimiter",       foreground: "94a3b8" },
            { token: "type.identifier", foreground: "fb923c" },
          ],
          colors: {
            "editor.background":                  "#0a0a0f",
            "editor.foreground":                  "#e2e8f0",
            "editor.lineHighlightBackground":     "#1e293b40",
            "editor.selectionBackground":         "#334155",
            "editorLineNumber.foreground":        "#475569",
            "editorLineNumber.activeForeground":  "#94a3b8",
            "editor.inactiveSelectionBackground": "#1e293b",
            "scrollbarSlider.background":         "#334155",
            "scrollbarSlider.hoverBackground":    "#475569",
            "editorGutter.background":            "#0a0a0f",
            "editorCursor.foreground":            "#818cf8",
          },
        });
        monaco.editor.setTheme(APP_THEME);

        injectCSS();

        editor.updateOptions({
          minimap:              { enabled: false },
          scrollBeyondLastLine: false,
          fontSize:             13,
          fontFamily:           "'JetBrains Mono','Fira Code','Cascadia Code',monospace",
          fontLigatures:        true,
          lineNumbers:          "on",
          renderLineHighlight:  "gutter",
          cursorBlinking:       "smooth",
          smoothScrolling:      true,
          padding:              { top: 12, bottom: 12 },
          readOnly,
          wordWrap:             "off",
          tabSize:              4,
          insertSpaces:         true,
          folding:              true,
          automaticLayout:      true,
          stickyScroll:         { enabled: false },
        });
      },
      [readOnly],
    );

    // ── Render ─────────────────────────────────────────────────────────────

    return (
      <Editor
        height={height}
        language="python"
        value={value}
        theme={APP_THEME}
        onMount={handleMount}
        onChange={(v) => onChange?.(v ?? "")}
        loading={
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Loading editor…
          </div>
        }
        options={{
          minimap:         { enabled: false },
          fontSize:        13,
          fontFamily:      "'JetBrains Mono','Fira Code',monospace",
          padding:         { top: 12, bottom: 12 },
          readOnly,
          automaticLayout: true,
          stickyScroll:    { enabled: false },
        }}
      />
    );
  },
);
