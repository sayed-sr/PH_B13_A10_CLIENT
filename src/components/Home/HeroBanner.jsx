"use client";
import { Button } from "@heroui/react";
import Link from "next/link";
import { MapPin } from "lucide-react";

export default function HeroBanner() {
  return (
    <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
      
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-slate-900/60" /> {/* Dark Overlay */}
      </div>

      <div className="relative z-10 text-center px-4 max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
          Your Journey Starts Here
        </h1>
        <p className="text-lg md:text-xl text-slate-200 mb-8 font-medium">
          Book bus, train, launch, and flight tickets instantly with TicketBari. Secure, fast, and reliable.
        </p>
        
        <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-3 items-center w-full max-w-4xl mx-auto">
          <div className="flex-1 w-full flex items-center bg-slate-100 rounded-xl px-4 py-3">
             <MapPin className="text-slate-400 mr-2" size={20} />
             <input type="text" placeholder="Leaving from..." className="bg-transparent outline-none w-full text-slate-700" />
          </div>
          <div className="flex-1 w-full flex items-center bg-slate-100 rounded-xl px-4 py-3">
             <MapPin className="text-slate-400 mr-2" size={20} />
             <input type="text" placeholder="Going to..." className="bg-transparent outline-none w-full text-slate-700" />
          </div>
          <Link href="/tickets" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-blue-600 text-white font-bold h-12 px-8 rounded-xl hover:bg-blue-700">
              Search Tickets
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}