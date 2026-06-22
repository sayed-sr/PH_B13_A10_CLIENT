"use client";

import { useEffect, useState, useCallback } from "react";
import { Input, Button, Card, Spinner, Pagination } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, MapPin, Calendar, Search } from "lucide-react";
import axios from "axios";

export default function AllTicketsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [fromLoc, setFromLoc] = useState(searchParams.get("from") || "");
  const [toLoc, setToLoc] = useState(searchParams.get("to") || "");
  const [transportType, setTransportType] = useState("");
  const [priceSort, setPriceSort] = useState("");

  const triggerSearchFetch = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("status", "approved");
      queryParams.append("page", page.toString());
      queryParams.append("limit", "6"); // Explicitly limit to 6 items to create page 2!

      if (fromLoc && fromLoc.trim() !== "") queryParams.append("from", fromLoc.trim());
      if (toLoc && toLoc.trim() !== "") queryParams.append("to", toLoc.trim());
      if (transportType && transportType.trim() !== "") queryParams.append("transport", transportType.trim());
      if (priceSort && priceSort.trim() !== "") queryParams.append("sort", priceSort.trim());

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tickets?${queryParams.toString()}`);
      
      const fetchedTickets = response.data.tickets || (Array.isArray(response.data) ? response.data : []);
      const serverTotalPages = response.data.totalPages;

      setTickets(fetchedTickets);

      if (serverTotalPages !== undefined && serverTotalPages !== null) {
        setTotalPages(Number(serverTotalPages));
      } else {
        setTotalPages(1);
      }
    } catch (err) {
      console.error("HeroUI component routing execution error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, fromLoc, toLoc, transportType, priceSort]);

  useEffect(() => {
    triggerSearchFetch();
  }, [page, transportType, priceSort, triggerSearchFetch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">All Approved Trips</h1>
        <p className="text-sm text-slate-500 mt-1">Browse, filter, and schedule your departures with total confidence.</p>
      </div>

      <Card className="p-5 border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-white rounded-2xl">
        <Input label="From Location" value={fromLoc} onChange={(e) => setFromLoc(e.target.value)} placeholder="e.g. Dhaka" variant="bordered" radius="xl" />
        <Input label="To Location" value={toLoc} onChange={(e) => setToLoc(e.target.value)} placeholder="e.g. Sylhet" variant="bordered" radius="xl" />
        
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold text-slate-600 pl-1">Transport Type</label>
          <select 
            value={transportType} 
            onChange={(e) => { setPage(1); setTransportType(e.target.value); }}
            className="w-full h-[48px] px-3 rounded-xl border-2 border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-blue-500 transition"
          >
            <option value="">All Types</option>
            <option value="Bus">Bus</option>
            <option value="Train">Train</option>
            <option value="Launch">Launch</option>
            <option value="Flight">Flight</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold text-slate-600 pl-1">Sort Price</label>
          <select 
            value={priceSort} 
            onChange={(e) => { setPage(1); setPriceSort(e.target.value); }}
            className="w-full h-[48px] px-3 rounded-xl border-2 border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-blue-500 transition"
          >
            <option value="">Default</option>
            <option value="lowToHigh">Low to High</option>
            <option value="highToLow">High to Low</option>
          </select>
        </div>

        <Button onClick={() => { setPage(1); triggerSearchFetch(); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-[48px] rounded-xl w-full flex gap-2">
          <Search size={16} /> Filter Results
        </Button>
      </Card>

      {loading ? (
        <div className="py-20 flex justify-center w-full"><Spinner label="Updating Inventory Records..." /></div>
      ) : tickets.length === 0 ? (
        <div className="py-20 text-center text-slate-400 font-medium">No transit tickets match your active parameters.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <Card key={ticket._id} className="flex flex-col h-full border border-slate-100 bg-white shadow-sm rounded-2xl overflow-hidden">
              <div className="h-44 bg-slate-100 relative">
                <img src={ticket.image || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600"} className="w-full h-full object-cover" alt="" />
                <span className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">{ticket.transportType}</span>
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{ticket.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                    <MapPin size={12} className="text-slate-400" />
                    <span>{ticket.from}</span>
                    <ArrowRight size={10} />
                    <span>{ticket.to}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                    <Calendar size={12} />
                    <span>Departure: {new Date(ticket.departureTime).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-400">Seats remaining: <strong className="text-slate-700">{ticket.quantity}</strong></span>
                    <p className="text-lg font-bold text-blue-600">${ticket.price}</p>
                  </div>
                  <Button className="w-full bg-blue-600 text-white font-bold rounded-xl" onClick={() => router.push(`/tickets/${ticket._id}`)}>
                    See Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 🔮 Integrated cleanly based on the HeroUI layout snippet */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-10">
          <Pagination className="justify-center">
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous 
                  isDisabled={page === 1} 
                  onPress={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  <Pagination.PreviousIcon />
                  <span>Previous</span>
                </Pagination.Previous>
              </Pagination.Item>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Pagination.Item key={p}>
                  <Pagination.Link 
                    isActive={p === page} 
                    onPress={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  >
                    {p}
                  </Pagination.Link>
                </Pagination.Item>
              ))}
              
              <Pagination.Item>
                <Pagination.Next 
                  isDisabled={page === totalPages} 
                  onPress={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  <span>Next</span>
                  <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        </div>
      )}
    </div>
  );
}