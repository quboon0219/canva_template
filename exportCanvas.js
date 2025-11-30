import html2canvas from "html2canvas";

export async function exportCanvasAsPNG(node, filename = "design.png", scale = 2) {
  if (!node) throw new Error('no node');
  const origBg = node.style.backgroundColor;
  if (!origBg) node.style.backgroundColor = "#ffffff";

  const opts = {
    backgroundColor: null,
    scale,
    useCORS: true,
    logging: false,
    scrollX: -window.scrollX,
    scrollY: -window.scrollY
  };
  const canvas = await html2canvas(node, opts);
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  node.style.backgroundColor = origBg;
}

export function exportElementsToSVG(elements, width=800, height=600, filename='design.svg') {
  const svgParts = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
  ];
  elements.forEach(el => {
    if (el.type === 'rect') {
      svgParts.push(`<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${el.bg||'#eee'}" />`);
    } else if (el.type === 'text') {
      const fontFamily = el.fontFamily || 'sans-serif';
      const fontSize = el.fontSize || 18;
      const text = (el.text||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      svgParts.push(`<text x="${el.x}" y="${el.y + fontSize}" font-family="${fontFamily}" font-size="${fontSize}">${text}</text>`);
    } else if (el.type === 'image') {
      svgParts.push(`<image x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" href="${el.src}" preserveAspectRatio="xMidYMid slice" />`);
    }
  });
  svgParts.push('</svg>');
  const svgStr = svgParts.join('\n');
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
