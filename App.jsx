import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import GalleryPage from "./components/GalleryPage";
import TemplateDetails from "./components/TemplateDetails";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-4">
        <Routes>
          <Route path="/" element={<GalleryPage />} />
          <Route path="/template/:id" element={<TemplateDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}
