import React from "react";
import { Link } from "react-router-dom";

export default function TemplateCard({template}) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <img src={template.thumbnail} alt={template.title} className="w-full h-44 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-lg">{template.title}</h3>
        <p className="text-sm text-slate-500 mt-1">{template.tags.join(", ")}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="font-bold">${template.price}</div>
          <Link to={`/template/${template.id}`} className="text-sm text-primary">Preview</Link>
        </div>
      </div>
    </div>
  );
}
