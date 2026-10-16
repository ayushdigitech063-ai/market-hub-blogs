import React, { useMemo } from "react";
import { ListTree } from "lucide-react";
import { Card } from "../ui";
import { Toggle } from "./FaqEditor";
import { extractHeadings } from "../seo/seoUtils";


export default function TocPreview({ html, enabled, onToggle }) {
  const headings = useMemo(() => extractHeadings(html), [html]);

  return (
    <Card title="Table of Contents" icon={ListTree}
      right={<Toggle checked={enabled} onChange={onToggle} label={enabled ? "Show on page" : "Hidden"} />}>
      <p className="mb-3 text-[11px] text-slate-500">
      Auto-generated: Whatever Heading 2 / Heading 3 you add in the editor will appear here.
      </p>
      {headings.length === 0 ? (
        <p className="rounded-lg bg-orange-50 px-3 py-2 text-xs text-slate-500">
          There are no headings yet. Please add H2/H3 in the content.
        </p>
      ) : (
        <ol className="space-y-1 rounded-lg border border-orange-100 bg-orange-50/40 p-3">
          {headings.map((h, i) => (
            <li key={h.id} className={`text-xs ${h.level === 3 ? "ml-5 text-slate-500" : "font-semibold text-slate-800"}`}>
              <span className="mr-1.5 text-orange-500">{i + 1}.</span>{h.text}
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
