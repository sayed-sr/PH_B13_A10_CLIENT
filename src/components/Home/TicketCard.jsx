"use client";
import { Card, Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client"; 
import { ArrowRight, MapPin } from "lucide-react";

export default function TicketCard({ ticket }) {
  const router = useRouter();
  const { data: session } = useSession();

  const handleDetailsNavigation = () => {
    
    if (!session || !session.user) {
      alert("🔒 Authentication Required!\nYou must be logged in to view ticket details.");
      window.location.href = "/auth/signin";
      return;
    }

    router.push(`/tickets/${ticket._id}`);
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden border border-slate-100 shadow-sm bg-white rounded-2xl">
     
      <div className="h-48 w-full overflow-hidden relative bg-slate-100">
        <img 
          src={ticket.image || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600"} 
          alt={ticket.title} 
          className="w-full h-full object-cover" 
        />
        <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {ticket.transportType}
        </span>
      </div>

     
      <div className="p-6 flex flex-col flex-grow justify-between gap-4">
        <div className="space-y-2">
          <h3 className="font-bold text-xl text-slate-800 line-clamp-1">{ticket.title}</h3>
          
          <div className="flex items-center text-slate-500 text-xs gap-1 font-medium">
            <MapPin size={14} className="text-slate-400" />
            <span>{ticket.from}</span>
            <ArrowRight size={12} className="mx-0.5" />
            <span>{ticket.to}</span>
          </div>

          
          <div className="flex flex-wrap gap-1.5 pt-2">
            {ticket.perks?.map((perk, i) => (
              <span key={i} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                {perk}
              </span>
            ))}
          </div>
        </div>

        
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-baseline border-t border-slate-100 pt-3">
            <span className="text-xs text-slate-400 font-medium">
              Available Inventory: <strong className="text-slate-700">{ticket.quantity}</strong>
            </span>
            <p className="text-xl font-extrabold text-blue-600">
              ${ticket.price}<span className="text-xs text-slate-400 font-normal">/unit</span>
            </p>
          </div>
          
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl" 
            onClick={handleDetailsNavigation}
          >
            See Details
          </Button>
        </div>
      </div>
    </Card>
  );
}