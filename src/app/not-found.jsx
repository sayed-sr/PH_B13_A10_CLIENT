"use client";

import { Link } from "@heroui/react";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center space-y-6 max-w-xl mx-auto">
      <div className="h-20 w-20 bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center rounded-3xl shadow-inner animate-bounce">
        <AlertCircle size={40} />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">404 - Invalid Routing Sheet Exception</h1>
        <p className="text-sm text-slate-400 font-medium leading-relaxed">
          The requested system route mapping parameter directory path could not be located on the platform clusters network infrastructure layer.
        </p>
      </div>
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white h-11 px-6 rounded-xl transition shadow-md"
      >
        <ArrowLeft size={14} /> Return to Secure System Gateway Root
      </Link>
    </div>
  );
}