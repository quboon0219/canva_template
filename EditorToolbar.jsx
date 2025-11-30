import React from "react";

export default function EditorToolbar({ onAddText, onExportPNG, onExportSVG, onAddImage, onCreateGroup, onUploadFont }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
      <button onClick={onAddText} className="px-3 py-1 rounded bg-white border">Add text</button>
      <button onClick={onAddImage} className="px-3 py-1 rounded bg-white border">Add image</button>
      <button onClick={onCreateGroup} className="px-3 py-1 rounded bg-white border">Group</button>
      <button onClick={onExportPNG} className="px-3 py-1 rounded bg-primary text-white">Download PNG</button>
      <button onClick={onExportSVG} className="px-3 py-1 rounded border">Download SVG</button>
      <label className="ml-2 flex items-center gap-2 cursor-pointer">
        <span className="text-xs text-slate-500">Upload font</span>
        <input type="file" accept=".woff,.woff2,.ttf,.otf" onChange={(e)=> onUploadFont && onUploadFont(e.target.files[0])} className="hidden" />
      </label>
      <div className="ml-auto text-sm text-gray-500">Canvas controls</div>
      <input id="asset-file" type="file" accept="image/*" className="hidden" />
    </div>
  );
}
