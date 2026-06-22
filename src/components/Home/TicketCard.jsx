"use client";
import { Card, Button } from "@heroui/react";
import Link from "next/link";
import { Bus, Train, Ship, Plane, MapPin, Calendar, Users } from "lucide-react";

export default function TicketCard({ ticket }) {
  // Dynamic icon based on transport type
  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'train': return <Train size={18} />;
      case 'launch': return <Ship size={18} />;
      case 'flight': return <Plane size={18} />;
      default: return <Bus size={18} />;
    }
  };

  return (
    <Card className="flex flex-col h-full bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all rounded-2xl overflow-hidden">
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={ticket.image || "https://placehold.co/600x400/png"} 
          alt={ticket.title} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-slate-800 flex items-center gap-1.5 shadow-sm">
          {getIcon(ticket.transportType)} {ticket.transportType}
        </div>
        <div className="absolute bottom-3 right-3 bg-blue-600 px-3 py-1.5 rounded-lg text-white font-bold shadow-sm">
          ${ticket.price}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-slate-800 mb-3 line-clamp-1">{ticket.title}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-slate-600 text-sm">
             <MapPin size={16} className="mr-2 text-blue-500" />
             <span className="truncate">{ticket.from} <span className="font-bold mx-1">→</span> {ticket.to}</span>
          </div>
          <div className="flex items-center text-slate-600 text-sm">
             <Calendar size={16} className="mr-2 text-blue-500" />
             {new Date(ticket.departureDate).toLocaleString()}
          </div>
          <div className="flex items-center text-slate-600 text-sm">
             <Users size={16} className="mr-2 text-blue-500" />
             {ticket.quantity} Tickets Left
          </div>
        </div>

        {/* Perks */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {ticket.perks?.slice(0,3).map((perk, i) => (
            <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium border border-slate-200">
              {perk}
            </span>
          ))}
        </div>

        {/* Spacer to push button to bottom */}
        <div className="mt-auto">
          <Link href={`/tickets/${ticket._id}`} className="block w-full">
            <Button className="w-full bg-slate-900 text-white font-semibold hover:bg-blue-600 transition-colors rounded-xl h-11">
              See Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}