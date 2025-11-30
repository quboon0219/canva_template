import React, { useState } from "react";
import axios from "axios";

export default function AssetManager({ onSelect }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  async function handleLocalFiles(e) {
    const chosen = Array.from(e.target.files);
    const items = chosen.map(f => ({ name: f.name, url: URL.createObjectURL(f), file: f }));
    setFiles(prev => [...items, ...prev]);
  }

  async function uploadToProxy(fileObj) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', fileObj.file);
      const token = localStorage.getItem('token');
      const { data } = await axios.post((window.location.protocol + '//' + window.location.hostname + ':4242') + '/api/assets/upload-proxy', form, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      fileObj.publicUrl = data.url;
      alert('Uploaded: ' + data.url);
    } catch (e) {
      console.error(e);
      alert('Upload failed');
    }
    setUploading(false);
  }

  return (
    <div className="bg-white p-3 rounded-xl shadow">
      <h4 className="font-semibold mb-2">Assets</h4>
      <input type="file" accept="image/*" onChange={handleLocalFiles} />
      <div className="mt-3 grid grid-cols-3 gap-2 max-h-56 overflow-auto">
        {files.map((f, i) => (
          <div key={i} className="border rounded p-1">
            <img src={f.publicUrl || f.url} alt={f.name} className="w-full h-24 object-cover rounded" />
            <div className="flex gap-1 mt-1">
              <button onClick={() => onSelect(f.publicUrl || f.url, f.file)} className="text-xs px-2 py-1 bg-gray-100 rounded">Insert</button>
              {!f.publicUrl && <button onClick={() => uploadToProxy(f)} disabled={uploading} className="text-xs px-2 py-1 bg-blue-50 rounded">Upload</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
