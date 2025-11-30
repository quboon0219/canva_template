import React, {useEffect, useState} from "react";
import TemplateCard from "./TemplateCard";
import data from "../data/templates.json";

export default function GalleryPage(){
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    setTemplates(data);
  }, []);

  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Template Gallery</h1>
        <p className="text-sm text-slate-500">Browse and preview templates</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(t => <TemplateCard key={t.id} template={t} />)}
      </div>
    </section>
  );
}
