import React, { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import EditorToolbar from "./EditorToolbar";
import { exportCanvasAsPNG, exportElementsToSVG } from "../../utils/exportCanvas";
import useAutoSave from "../../hooks/useAutoSave";
import AssetManager from "../AssetManager";
import LayersPanel from "./LayersPanel";
import axios from "axios";

const SNAP = 8;
const GUIDE_THRESHOLD = 6;

function snap(v){ return Math.round(v/SNAP)*SNAP; }

export default function CanvasEditor({ template }) {
  const canvasRef = useRef(null);
  const [elements, setElements] = useState(template.elements || []);
  const [selected, setSelected] = useState([]);
  const [groups, setGroups] = useState([]);
  const [dynamicGuides, setDynamicGuides] = useState([]);
  const [fonts, setFonts] = useState([]);

  useAutoSave({ elements, groups }, `design-${template.id}`, 3000);

  useEffect(() => { setElements(template.elements || []); }, [template]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('uploadedFonts')||'[]');
      if (stored && stored.length) {
        setFonts(stored);
        stored.forEach(async (f) => {
          try { const ff = new FontFace(f.name, `url(${f.url})`); await ff.load(); document.fonts.add(ff); } catch(e) {}
        });
      }
    } catch(e){}
  }, []);

  function updateElement(idx, patch){ setElements(prev=> prev.map((el,i)=> i===idx? {...el,...patch}:el)); }

  function addText(){ setElements(prev=> [...prev, { type:'text', text:'New Text', x:40,y:40,w:200,h:50,fontSize:20,fontFamily:'sans-serif'}]); }
  function addImage(src){ setElements(prev=> [...prev, { type:'image', src, x:40,y:40,w:300,h:200 }]); }

  function computeGuides(idx, x,y,w,h){
    const guides=[];
    const canvasW=800, canvasH=template.thumbnail.includes('/800/800')?800:600;
    const edges=[ {name:'left',x},{name:'right',x:x+w},{name:'vcenter',x:x+w/2},{name:'top',y},{name:'bottom',y:y+h},{name:'hcenter',y:y+h/2} ];
    const canvasEdges=[ {type:'v',x:0},{type:'v',x:canvasW/2},{type:'v',x:canvasW},{type:'h',y:0},{type:'h',y:canvasH/2},{type:'h',y:canvasH} ];
    for(const ce of canvasEdges){
      if(ce.type==='v'){
        for(const e of edges.filter(e=>e.x!==undefined)){
          if(Math.abs(e.x-ce.x)<=GUIDE_THRESHOLD) guides.push({orientation:'v',x:Math.round(ce.x),snapTo:ce.x});
        }
      } else {
        for(const e of edges.filter(e=>e.y!==undefined)){
          if(Math.abs(e.y-ce.y)<=GUIDE_THRESHOLD) guides.push({orientation:'h',y:Math.round(ce.y),snapTo:ce.y});
        }
      }
    }
    elements.forEach((other,i)=>{ if(i===idx) return;
      const oe={ left:other.x, right:other.x+other.w, vcenter:other.x+other.w/2, top:other.y, bottom:other.y+other.h, hcenter:other.y+other.h/2 };
      for(const e of edges){
        if(e.x!==undefined){
          ['left','right','vcenter'].forEach(k=>{ if(Math.abs(e.x-oe[k])<=GUIDE_THRESHOLD) guides.push({orientation:'v',x:Math.round(oe[k]),snapTo:oe[k],targetIndex:i}); });
        } else {
          ['top','bottom','hcenter'].forEach(k=>{ if(Math.abs(e.y-oe[k])<=GUIDE_THRESHOLD) guides.push({orientation:'h',y:Math.round(oe[k]),snapTo:oe[k],targetIndex:i}); });
        }
      }
    });
    return guides;
  }

  function onDrag(i, d){ const el=elements[i]; const newX=snap(d.x); const newY=snap(d.y); setDynamicGuides(computeGuides(i,newX,newY,el.w,el.h)); }
  function onDragStop(i, d){
    const el=elements[i];
    const newX=snap(d.x); const newY=snap(d.y);
    const guides=computeGuides(i,newX,newY,el.w,el.h);
    let fx=newX, fy=newY;
    if(guides.length){
      const g=guides[0];
      if(g.orientation==='v') fx = Math.round(g.snapTo - el.w/2);
      if(g.orientation==='h') fy = Math.round(g.snapTo - el.h/2);
    }
    setElements(prev=> prev.map((e,idx)=> idx===i? {...e,x:fx,y:fy}:e));
    setDynamicGuides([]);
  }

  function onResize(i, ref, pos){ const w=snap(parseInt(ref.style.width)); const h=snap(parseInt(ref.style.height)); const x=snap(pos.x); const y=snap(pos.y); setDynamicGuides(computeGuides(i,x,y,w,h)); }
  function onResizeStop(i, ref, pos){ const w=snap(parseInt(ref.style.width)); const h=snap(parseInt(ref.style.height)); const x=snap(pos.x); const y=snap(pos.y); setElements(prev=> prev.map((e,idx)=> idx===i? {...e,x,y,w,h}:e)); setDynamicGuides([]); }

  function onSelect(e, idx){ if(e.shiftKey) setSelected(prev => prev.includes(idx)? prev.filter(x=>x!==idx): [...prev,idx]); else setSelected([idx]); }

  function createGroup(){ if(selected.length<2) return alert('Select multiple'); setGroups(prev=> [...prev,{ id:Date.now().toString(36), members:[...selected]}]); setSelected([]); }

  async function exportPNG(){ if(!canvasRef.current) return alert('No canvas'); await exportCanvasAsPNG(canvasRef.current, `${template.title||'design'}.png`, 2); }
  function exportSVG(){ exportElementsToSVG(elements, 800, template.thumbnail.includes('/800/800')?800:600, `${(template.title||'design').replace(/\W+/g,'_')}.svg`); }

  async function handleUploadFont(file){
    try {
      const form = new FormData(); form.append('file', file);
      const token = localStorage.getItem('token');
      const resp = await axios.post((window.location.protocol + '//' + window.location.hostname + ':4242') + '/api/assets/upload-proxy', form, { headers: { Authorization: `Bearer ${token}` } });
      const url = resp.data.url;
      const name = file.name.replace(/\W+/g,'_');
      const ff = new FontFace(name, `url(${url})`);
      await ff.load();
      document.fonts.add(ff);
      const fontObj = { name, url };
      setFonts(prev => { const next=[...prev,fontObj]; try{ localStorage.setItem('uploadedFonts', JSON.stringify(next)); }catch(e){} return next; });
      alert('Font uploaded and loaded: '+name);
    } catch(e){ console.error(e); alert('Font upload failed'); }
  }

  const canvasW = 800;
  const canvasH = template.thumbnail.includes("/800/800")?800:600;

  return (
    <div>
      <EditorToolbar onAddText={addText} onExportPNG={exportPNG} onExportSVG={exportSVG} onAddImage={()=> document.getElementById('asset-file').click()} onCreateGroup={createGroup} onUploadFont={handleUploadFont} />
      <div className="mt-3 flex gap-4">
        <div className="bg-white rounded-lg p-3 shadow flex-1">
          <div className="relative" style={{ width: canvasW, height: canvasH }}>
            <div id="canvas-root" ref={canvasRef} className="relative bg-white border" style={{ width: canvasW, height: canvasH }}>
              {elements.map((el,i)=> (
                <Rnd key={i} size={{ width: el.w, height: el.h }} position={{ x: el.x, y: el.y }} bounds="parent"
                  onDrag={(e,d)=> onDrag(i,d)} onDragStop={(e,d)=> onDragStop(i,d)}
                  onResize={(e,dir,ref,delta,pos)=> onResize(i,ref,pos)} onResizeStop={(e,dir,ref,delta,pos)=> onResizeStop(i,ref,pos)}
                  onClick={(e)=> onSelect(e,i)} enableResizing style={{ border: selected.includes(i)? '2px solid rgba(99,102,241,0.9)':'none', background: el.type==='image'?'transparent':(el.bg||'transparent') }}>
                  <div className="w-full h-full overflow-hidden p-1">
                    {el.type==='text' && (<div contentEditable suppressContentEditableWarning onBlur={(e)=> updateElement(i,{ text: e.target.textContent })} style={{ fontSize: el.fontSize || 18, lineHeight:1.1, fontFamily: el.fontFamily || 'sans-serif' }}>{el.text}</div>)}
                    {el.type==='rect' && (<div style={{ width:'100%', height:'100%', background: el.bg || '#eee' }} />)}
                    {el.type==='image' && (<img src={el.src} alt="" className="w-full h-full object-cover" />)}
                  </div>
                </Rnd>
              ))}
              {dynamicGuides.map((g,idx)=> g.orientation==='v' ? (<div key={idx} style={{ position:'absolute', left:g.x-1, top:0, bottom:0, width:2, background:'rgba(99,102,241,0.6)', pointerEvents:'none'}} />) : (<div key={idx} style={{ position:'absolute', top:g.y-1, left:0, right:0, height:2, background:'rgba(99,102,241,0.6)', pointerEvents:'none'}} />))}
            </div>
          </div>
        </div>

        <div style={{ width:300 }} className="flex flex-col gap-3">
          <AssetManager onSelect={(url)=> addImage(url)} />
          <LayersPanel elements={elements} setElements={setElements} selected={selected} setSelected={setSelected} groups={groups} ungroup={(id)=> setGroups(prev=> prev.filter(g=> g.id!==id))} />
          <div className="bg-white p-3 rounded-xl shadow">
            <h4 className="font-semibold">Fonts</h4>
            <div className="mt-2">
              {fonts.length===0 && <div className="text-xs text-slate-400">No uploaded fonts</div>}
              {fonts.length>0 && (
                <div className="flex flex-col gap-2">
                  <select className="p-2 border rounded" onChange={(e)=> {
                    const fontName = e.target.value;
                    setElements(prev => prev.map((el,i)=> selected.includes(i) && el.type==='text' ? { ...el, fontFamily: fontName } : el));
                  }}>
                    <option value="">-- choose font --</option>
                    {fonts.map((f,i)=> <option key={i} value={f.name}>{f.name}</option>)}
                  </select>
                  {fonts.map((f,i)=>( <div key={i} className="text-sm">{f.name}</div> ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
