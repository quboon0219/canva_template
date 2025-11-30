import React from "react";

export default function LayersPanel({ elements, setElements, selected, setSelected, groups, ungroup }) {
  function toggleSelect(i) {
    setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [i]);
  }
  function bringToFront(i) {
    setElements(prev => {
      const el = prev[i];
      const others = prev.filter((_, idx)=>idx!==i);
      return [...others, el];
    });
  }
  function sendBack(i) {
    setElements(prev => {
      const el = prev[i];
      const others = prev.filter((_, idx)=>idx!==i);
      return [el, ...others];
    });
  }
  return (
    <div className="bg-white p-3 rounded-xl shadow">
      <h4 className="font-semibold">Layers</h4>
      <div className="mt-2 flex flex-col gap-2 max-h-64 overflow-auto">
        {elements.map((el, i) => (
          <div key={i} className={`p-2 rounded flex items-center justify-between ${selected.includes(i) ? 'bg-indigo-50' : 'bg-gray-50'}`}>
            <div onClick={() => toggleSelect(i)} className="cursor-pointer">
              <div className="text-sm font-medium">{el.type}{el.text ? ` — ${el.text.substring(0,20)}` : ''}</div>
              <div className="text-xs text-slate-500">#{i}</div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => bringToFront(i)} className="text-xs px-2 py-1 bg-white rounded">↑</button>
              <button onClick={() => sendBack(i)} className="text-xs px-2 py-1 bg-white rounded">↓</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <h5 className="text-xs text-slate-500">Groups</h5>
        {groups.length === 0 && <div className="text-xs text-slate-400">No groups</div>}
        {groups.map(g => (
          <div key={g.id} className="flex items-center justify-between mt-1 text-sm">
            <div>{g.members.length} items</div>
            <div className="flex gap-2">
              <button onClick={() => setSelected(g.members)} className="px-2 py-1 text-xs bg-white rounded">Select</button>
              <button onClick={() => ungroup(g.id)} className="px-2 py-1 text-xs bg-white rounded">Ungroup</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
