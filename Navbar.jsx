import React from "react";
import { Link } from "react-router-dom";

export default function Navbar(){
  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg text-primary">CanvaSell</Link>
        <div className="flex gap-3 items-center">
          <input placeholder="Search templates..." className="hidden md:block border rounded px-3 py-1" />
          <Link to="/login" className="text-sm text-primary">Sign in</Link>
        </div>
      </div>
    </nav>
  );
}
