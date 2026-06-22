"use client";

import { use, useEffect, useState } from "react";
import { Button, Card, Spinner, Input } from "@heroui/react";
import { useSession } from "@/lib/auth-client"; 
import { Clock, Ticket, MapPin } from "lucide-react";
import axios from "axios";

export default function TicketDetailsPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const id = params.id;
  
  const { data: session } = useSession(); 
  const [isOpen, setIsOpen] = useState(false);

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingQty, setBookingQty] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  // Countdown State Hooks
  const [countdownText, setCountdownText] = useState("");
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    async function loadTicket() {
      try {
        // FIX: Requesting a large limit so your ticket is not missing due to backend pagination limits
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tickets?status=approved&limit=1000`);
        const allTickets = res.data.tickets || res.data || [];
        const individual = allTickets.find(t => t._id === id);
        setTicket(individual);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadTicket();
  }, [id]);

  useEffect(() => {
    if (!ticket) return;

    const timer = setInterval(() => {
      const departure = new Date(ticket.departureTime).getTime();
      const now = new Date().getTime();
      const diff = departure - now;

      if (diff <= 0) {
        setCountdownText("Trip has Already Departed");
        setIsPast(true);
        clearInterval(timer);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdownText(`${days}d ${hours}h ${mins}m ${secs}s remaining`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [ticket]);

  const handleBookingSubmit = async () => {
    setErrorText("");
    if (bookingQty > ticket.quantity) {
      setErrorText("Booking quantity cannot surpass available inventory.");
      return;
    }
    if (bookingQty < 1) {
      setErrorText("Minimum booking constraint must equal or surpass 1 unit.");
      return;
    }

    setBookingLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/bookings`,
        {
          ticketId: ticket._id,
          title: ticket.title,
          image: ticket.image,
          quantity: parseInt(bookingQty),
          unitPrice: ticket.price,
          totalPrice: ticket.price * parseInt(bookingQty),
          from: ticket.from,
          to: ticket.to,
          departureTime: ticket.departureTime,
          userEmail: session?.user?.email,
          vendorEmail: ticket.vendorEmail,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsOpen(false);
      alert("Booking Request Logged as Pending! Check your User Dashboard.");
    } catch (err) {
      setErrorText("Failed to register booking transaction framework safe routes.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!ticket) return <div className="p-20 text-center font-bold text-red-500">Ticket specification sheet data could not be fetched.</div>;

  const isBookable = !isPast && ticket.quantity > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Card className="p-8 space-y-6 border border-slate-100 rounded-3xl bg-white shadow-xl">
        <div className="h-72 w-full rounded-2xl overflow-hidden bg-slate-50">
          <img src={ticket.image || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600"} className="w-full h-full object-cover" alt="" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">{ticket.title}</h1>
            <p className="text-blue-600 font-bold text-sm tracking-wider mt-1 uppercase">{ticket.transportType} Transit Line</p>
          </div>
          <div className="bg-amber-50 text-amber-700 border border-amber-200 p-4 rounded-xl flex items-center gap-2 font-mono text-sm shadow-inner">
            <Clock size={16} className="animate-pulse" />
            <span>{countdownText}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600 leading-relaxed">
          <div className="space-y-3">
            <p className="flex items-center gap-2"><MapPin size={16} className="text-slate-400" /> <strong>Route Context:</strong> {ticket.from} to {ticket.to}</p>
            <p><strong>Scheduled Departure:</strong> {new Date(ticket.departureTime).toLocaleString()}</p>
            <p><strong>Operator In-Charge:</strong> {ticket.vendorName || "Verified Operator"}</p>
          </div>
          <div className="space-y-3">
            <p><strong>Seat Stock Level:</strong> {ticket.quantity === 0 ? <span className="text-red-500 font-bold uppercase">Sold Out</span> : <span className="text-slate-800 font-semibold">{ticket.quantity} slots left</span>}</p>
            <p className="text-2xl font-black text-blue-600">${ticket.price} <span className="text-xs text-slate-400 font-normal">USD / seat</span></p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Perks Included:</p>
          <div className="flex flex-wrap gap-2">
            {ticket.perks?.map((perk, idx) => (
              <span key={idx} className="bg-white px-3 py-1 text-xs font-semibold text-slate-700 rounded-lg shadow-sm border border-slate-200">{perk}</span>
            ))}
          </div>
        </div>

        <Button isDisabled={!isBookable} onClick={() => setIsOpen(true)} size="lg" className={`w-full font-bold h-14 rounded-xl text-white shadow-md ${isBookable ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-300 cursor-not-allowed"}`}>
          {ticket.quantity === 0 ? "Sold Out" : isPast ? "Trip Expired" : "Book Journey Spot Now"}
        </Button>
      </Card>

      {/* Import-Safe Custom Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex gap-2 items-center text-slate-800 font-bold text-lg p-6 border-b border-slate-100">
              <Ticket className="text-blue-600" size={20} />
              <span>Confirm Seat Quantity</span>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500">Input your desired seating requirements. Your ticket quantity cannot exceed available operator limits ({ticket.quantity}).</p>
              <Input
                type="number"
                label="Ticket Slots"
                min={1}
                max={ticket.quantity}
                value={bookingQty}
                onChange={(e) => setBookingQty(e.target.value)}
                variant="bordered"
                className="text-slate-900 font-bold"
              />
              <div className="flex justify-between items-center text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border">
                <span>Gross Price Matrix:</span>
                <span className="text-blue-600 text-lg">${ticket.price * bookingQty}</span>
              </div>
              {errorText && <p className="text-xs text-red-500 font-bold">{errorText}</p>}
            </div>

            <div className="flex justify-end gap-2 p-4 bg-slate-50 border-t border-slate-100">
              <Button variant="flat" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button className="bg-blue-600 text-white font-bold" isLoading={bookingLoading} onClick={handleBookingSubmit}>Confirm Reservation</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}