"use client";

import { useEffect, useState } from "react";
import { Button, Card, Spinner, Input } from "@heroui/react";
import { useRouter } from "next/navigation"; // <-- Fixed here
import { Search, ShieldCheck, Zap, Clock, MapPin, ArrowRight } from "lucide-react";
import { useSession } from "@/lib/auth-client"; 
import axios from "axios";

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession(); // 2. Get your session hook state data
  const [advTickets, setAdvTickets] = useState([]);
  const [latestTickets, setLatestTickets] = useState([]);
  const [loading, setLoading] = useState(true);


  const [fromLoc, setFromLoc] = useState("");
  const [toLoc, setToLoc] = useState("");

  useEffect(() => {
    async function fetchHomeData() {
      try {
        const advRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tickets/advertised`);
        const latestRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tickets?limit=8`);
        setAdvTickets(advRes.data || []);
        setLatestTickets(latestRes.data.tickets || []);
      } catch (err) {
        console.error("Home loading failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    router.push(`/tickets?from=${encodeURIComponent(fromLoc)}&to=${encodeURIComponent(toLoc)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" label="Loading TicketBari..." />
      </div>
    );
  }

  return (
    <div className="space-y-20 pb-20">
      
      <section className="relative min-h-[60vh] flex items-center bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-multiply bg-cover bg-center" 
             style={{ backgroundImage: "url('https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1920&q=80')" }}>
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-900/90 via-indigo-950/80 to-transparent"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full text-left space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-sm uppercase tracking-wider">
            Direct Operator Bookings
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none max-w-3xl">
            Your Premium Gateway to <span className="text-blue-400 bg-clip-text">Effortless Journey</span> Tickets
          </h1>
          <p className="max-w-xl text-base md:text-lg text-slate-300 leading-relaxed">
            Reserve verified seats instantly across high-speed rail lines, intercity luxury coaches, marine launches, and regional domestic flights.
          </p>
        </div>
      </section>

    
      {advTickets.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800">Featured Deals</h2>
            <p className="text-sm text-slate-500 mt-1">Top-tier verified transit routes handpicked by administration.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advTickets.slice(0, 6).map((ticket) => (
              <TicketCard key={ticket._id} ticket={ticket} router={router} session={session} />
            ))}
          </div>
        </section>
      )}

      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Recently Added Tickets</h2>
          <p className="text-sm text-slate-500 mt-1">Fresh trip updates across multiple premium intercity networks.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestTickets.map((ticket) => (
            <TicketCard key={ticket._id} ticket={ticket} router={router} session={session} />
          ))}
        </div>
      </section>

   
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50 py-12 rounded-3xl border border-slate-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800">Popular Routes</h2>
          <p className="text-sm text-slate-500 mt-1">The most-traveled paths prioritized by daily commuters.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { from: "Dhaka", to: "Cox's Bazar", type: "Bus" },
            { from: "Dhaka", to: "Chittagong", type: "Train" },
            { from: "Dhaka", to: "Sylhet", type: "Flight" },
            { from: "Dhaka", to: "Barisal", type: "Launch" },
          ].map((route, i) => (
            <Card key={i} className="p-5 hover:shadow-md transition border border-slate-100 cursor-pointer bg-white rounded-xl" onClick={() => router.push(`/tickets?from=${route.from}&to=${route.to}`)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{route.type}</p>
                  <p className="font-semibold text-slate-800 mt-1">{route.from} to {route.to}</p>
                </div>
                <ArrowRight size={16} className="text-slate-400" />
              </div>
            </Card>
          ))}
        </div>
      </section>

     
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Why Choose TicketBari?</h2>
          <p className="text-sm text-slate-500 mt-1">Building digital systems with integrity, performance, and transparency.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3 flex flex-col items-center">
            <div className="bg-blue-100 p-4 rounded-2xl text-blue-600"><ShieldCheck size={32} /></div>
            <h3 className="text-xl font-bold text-slate-800">Fully Anti-Fraud Monitoring</h3>
            <p className="text-sm text-slate-500 max-w-xs">Admin filters prevent faulty listings, flagging black market activity instantly.</p>
          </div>
          <div className="space-y-3 flex flex-col items-center">
            <div className="bg-blue-100 p-4 rounded-2xl text-blue-600"><Zap size={32} /></div>
            <h3 className="text-xl font-bold text-slate-800">Instant Pay Outs</h3>
            <p className="text-sm text-slate-500 max-w-xs">Secure credit card settlements via Stripe automation pipelines.</p>
          </div>
          <div className="space-y-3 flex flex-col items-center">
            <div className="bg-blue-100 p-4 rounded-2xl text-blue-600"><Clock size={32} /></div>
            <h3 className="text-xl font-bold text-slate-800">Real-time Countdown Tracking</h3>
            <p className="text-sm text-slate-500 max-w-xs">Automatic lockouts ensure you never buy a ticket for a past departure.</p>
          </div>
        </div>
      </section>
    </div>
  );
}


function TicketCard({ ticket, router, session }) {
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
        <img src={ticket.image || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600"} alt={ticket.title} className="w-full h-full object-cover" />
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
            <span className="text-xs text-slate-400 font-medium">Available Inventory: <strong className="text-slate-700">{ticket.quantity}</strong></span>
            <p className="text-xl font-extrabold text-blue-600">${ticket.price}<span className="text-xs text-slate-400 font-normal">/unit</span></p>
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