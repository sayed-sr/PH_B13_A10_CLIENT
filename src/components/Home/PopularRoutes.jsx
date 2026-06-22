import { Card } from "@heroui/react";
import { MapPin } from "lucide-react";

export default function PopularRoutes() {
  // Static attractive data for extra homepage sections
  const routes = [
    { from: "Dhaka", to: "Cox's Bazar", price: "Starts at $15", img: "https://images.unsplash.com/photo-1600010996841-397aeb889076?w=600&auto=format&fit=crop" },
    { from: "Dhaka", to: "Sylhet", price: "Starts at $12", img: "https://images.unsplash.com/photo-1623940173266-9a259c636f0e?w=600&auto=format&fit=crop" },
    { from: "Dhaka", to: "Chittagong", price: "Starts at $10", img: "https://images.unsplash.com/photo-1590059344265-5c20202996d9?w=600&auto=format&fit=crop" }
  ];

  return (
    <section>
      <h2 className="text-3xl font-bold text-slate-800 mb-8">Popular Routes</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {routes.map((route, i) => (
          <Card key={i} className="relative h-64 overflow-hidden rounded-2xl group cursor-pointer border-none">
            <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-colors z-10" />
            <img 
              src={route.img} 
              alt={route.to} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
            <div className="absolute bottom-0 left-0 p-6 z-20 text-white w-full bg-gradient-to-t from-slate-900/80 to-transparent">
              <h3 className="text-xl font-bold flex items-center gap-2"><MapPin size={20}/> {route.from} to {route.to}</h3>
              <p className="font-medium mt-1 text-slate-200">{route.price}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}