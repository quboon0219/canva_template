import React from "react";
import { useParams } from "react-router-dom";
import data from "../data/templates.json";
import CanvasEditor from "./CanvasEditor/CanvasEditor";

export default function TemplateDetails(){
  const { id } = useParams();
  const template = data.find(t => t.id === id);

  if (!template) return <div>Template not found</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl p-4 shadow">
          <h2 className="text-xl font-semibold">{template.title}</h2>
          <p className="text-sm text-slate-500">{template.description}</p>
          <div className="mt-4">
            <CanvasEditor template={template} />
          </div>
        </div>
      </div>
      <aside>
        <div className="bg-white rounded-xl p-4 shadow">
          <div className="text-lg font-bold">${template.price}</div>
          <button className="mt-4 w-full bg-primary text-white py-2 rounded-xl">Add to Cart</button>
          <div className="mt-4">
            <h4 className="font-semibold">Tags</h4>
            <div className="flex gap-2 flex-wrap mt-2">
              {template.tags.map(tag => <span key={tag} className="text-xs px-2 py-1 bg-gray-100 rounded">{tag}</span>)}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
