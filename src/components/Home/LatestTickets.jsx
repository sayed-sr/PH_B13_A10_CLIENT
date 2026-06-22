"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import TicketCard from "./TicketCard";
import { Spinner } from "@heroui/react";

export default function LatestTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // Reuses the base tickets API, limits to 6, and ensures they are approved
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tickets?limit=6&status=approved`);
        setTickets(res.data.tickets || res.data);
      } catch (err) {
        console.error("Failed to fetch latest tickets", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (tickets.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Latest Tickets Available</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map(ticket => (
          <TicketCard key={ticket._id} ticket={ticket} />
        ))}
      </div>
    </section>
  );
}