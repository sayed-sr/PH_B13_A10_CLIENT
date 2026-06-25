"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { Card, Button, Checkbox, Spinner } from "@heroui/react";
import { User, PlusCircle, Layers, ClipboardList, BarChart3, ArrowRight, Trash2, Edit, ShieldX } from "lucide-react";
import axios from "axios";

export default function VendorDashboard() {
  const { data: session, isPending } = useSession();
  const [activeTab, setActiveTab] = useState("a"); 

  // Dashboard state caches
  const [myTickets, setMyTickets] = useState([]);
  const [requestedBookings, setRequestedBookings] = useState([]);
  const [stats, setStats] = useState({ totalTicketsAdded: 0, totalTicketsSold: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(false);
  const [realUserRole, setRealUserRole] = useState("user"); 


  const [title, setTitle] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [transportType, setTransportType] = useState("Bus");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [perks, setPerks] = useState([]);
  const [imageUrl, setImageUrl] = useState(""); 


  const [editingTicket, setEditingTicket] = useState(null);

  const getAuthToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("access_token");
  };

 
  const fetchDashboardData = useCallback(async (silent = false) => {
    if (!session?.user?.email) return;
    if (!silent) setLoading(true);
    
    try {
      const token = getAuthToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const usersRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users`, config);
      const matchedUser = (usersRes.data || []).find(u => u.email === session.user.email);
      if (matchedUser) {
        setRealUserRole(matchedUser.role); 
      }

      
      if (matchedUser && matchedUser.role === "vendor") {
        const ticketsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tickets?limit=1000`, config);
        const allTickets = ticketsRes.data.tickets || ticketsRes.data || [];
        const filteredTickets = allTickets.filter(t => t.vendorEmail === session.user.email);
        setMyTickets(filteredTickets);

        const bookingsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/bookings?vendorEmail=${session.user.email}`, config);
        const bookingsData = bookingsRes.data.bookings || bookingsRes.data || [];
        setRequestedBookings(bookingsData);

        const statsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/vendor-stats?email=${session.user.email}`, config);
        setStats(statsRes.data || { totalTicketsAdded: filteredTickets.length, totalTicketsSold: 0, totalRevenue: 0 });
      }
    } catch (err) {
      console.error("Collection fetching error:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);


  useEffect(() => {
    if (session?.user?.email) {
      fetchDashboardData(false);
    }
  }, [session?.user?.email, fetchDashboardData]);

 
  useEffect(() => {
    if (session?.user?.email && realUserRole === "vendor") {
      fetchDashboardData(true);
    }
  }, [activeTab, session?.user?.email, realUserRole, fetchDashboardData]);

  const handleAddTicketSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/tickets`, {
        title,
        from,
        to,
        transportType,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        departureTime,
        perks,
        image: imageUrl || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600", 
        vendorName: session?.user?.name || "sakil",
        vendorEmail: session?.user?.email
      }, config);

      alert("Ticket saved successfully!");
      setTitle(""); setFrom(""); setTo(""); setPrice(""); setQuantity(""); setDepartureTime(""); setPerks([]); setImageUrl("");
      setActiveTab("c");
    } catch (err) {
      alert("Verification submission error.");
    }
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      
      



      const payload = {
        ...editingTicket,
        price: parseFloat(editingTicket.price) || 0,
        quantity: parseInt(editingTicket.quantity) || 0
      };

      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${editingTicket._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Ticket updated successfully!");
      setEditingTicket(null);
      fetchDashboardData(true);
    } catch (err) {
      alert("Failed to modify ticket details.");
    }
  };





  const handleDeleteTicket = async (id) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;
    try {
      const token = getAuthToken();
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDashboardData(true);
    } catch (err) {
      alert("Delete transaction failed.");
    }
  };

  const handleBookingAction = async (id, chosenStatus) => {
    try {
      const token = getAuthToken();
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${id}`, { status: chosenStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDashboardData(true);
    } catch (err) {
      alert("Booking adjustment action failed.");
    }
  };

  if (isPending || (loading && myTickets.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner label="Resolving Database Sync Layer..." />
      </div>
    );
  }

  if (realUserRole !== "vendor") {
    return (
      <div className="max-w-md mx-auto my-20 p-8 border border-slate-200 bg-white rounded-3xl shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto border">
          <ShieldX size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Standard User Profile</h2>
        <p className="text-sm text-slate-500 font-medium">
          Your account status is currently set to <strong>Standard User</strong>. You will need admin clearance validation approval before your system features open up.
        </p>
        <div className="p-4 bg-slate-50 border rounded-xl text-left text-xs font-mono text-slate-400">
          Authenticated Account: {session?.user?.email}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8 min-h-[80vh]">
      
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 flex flex-col gap-2">
        <Button onClick={() => setActiveTab("a")} className={`justify-start gap-3 h-12 font-bold rounded-xl ${activeTab === "a" ? "bg-blue-600 text-white" : "bg-transparent text-slate-600 hover:bg-slate-100"}`}><User size={18} /> a) Vendor Profile</Button>
        <Button onClick={() => setActiveTab("b")} className={`justify-start gap-3 h-12 font-bold rounded-xl ${activeTab === "b" ? "bg-blue-600 text-white" : "bg-transparent text-slate-600 hover:bg-slate-100"}`}><PlusCircle size={18} /> b) Add Ticket</Button>
        <Button onClick={() => setActiveTab("c")} className={`justify-start gap-3 h-12 font-bold rounded-xl ${activeTab === "c" ? "bg-blue-600 text-white" : "bg-transparent text-slate-600 hover:bg-slate-100"}`}><Layers size={18} /> c) My Added Tickets</Button>
        <Button onClick={() => setActiveTab("d")} className={`justify-start gap-3 h-12 font-bold rounded-xl ${activeTab === "d" ? "bg-blue-600 text-white" : "bg-transparent text-slate-600 hover:bg-slate-100"}`}><ClipboardList size={18} /> d) Requested Bookings</Button>
        <Button onClick={() => setActiveTab("e")} className={`justify-start gap-3 h-12 font-bold rounded-xl ${activeTab === "e" ? "bg-blue-600 text-white" : "bg-transparent text-slate-600 hover:bg-slate-100"}`}><BarChart3 size={18} /> e) Revenue Overview</Button>
      </aside>

     
      <main className="flex-1 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        
        {/* a) Vendor Profile section */}
        {activeTab === "a" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">a) Vendor Profile</h2>
            <div className="flex items-center gap-6 p-6 bg-slate-50 border rounded-2xl">
              <div className="h-20 w-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl overflow-hidden border">
                {session?.user?.image ? <img src={session.user.image} className="w-full h-full object-cover" alt="" /> : <User size={32} />}
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold text-slate-800">Name: {session?.user?.name || "sakil"}</p>
                <p className="text-sm text-slate-500 font-medium">Email: {session?.user?.email}</p>
                <p className="text-sm text-slate-500 font-medium">Role: {realUserRole}</p>
              </div>
            </div>
          </div>
        )}


        {activeTab === "b" && (
          <form onSubmit={handleAddTicketSubmit} className="space-y-5 max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-800">b) Add Ticket</h2>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Ticket title</label>
              <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter ticket title" className="h-12 border-2 border-slate-200 rounded-xl px-4 text-sm bg-white outline-none focus:border-blue-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">From(Location)</label>
                <input required value={from} onChange={e => setFrom(e.target.value)} placeholder="Departure city" className="h-12 border-2 border-slate-200 rounded-xl px-4 text-sm bg-white outline-none focus:border-blue-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">To(Location)</label>
                <input required value={to} onChange={e => setTo(e.target.value)} placeholder="Destination city" className="h-12 border-2 border-slate-200 rounded-xl px-4 text-sm bg-white outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Transport type</label>
                <select value={transportType} onChange={e => setTransportType(e.target.value)} className="h-12 border-2 border-slate-200 rounded-xl px-3 text-sm bg-white outline-none focus:border-blue-500">
                  <option value="Bus">Bus</option>
                  <option value="Train">Train</option>
                  <option value="Launch">Launch</option>
                  <option value="Flight">Flight</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Price(per unit)</label>
                <input type="number" required value={price} onChange={e => setPrice(e.target.value)} placeholder="Price value" className="h-12 border-2 border-slate-200 rounded-xl px-4 text-sm bg-white outline-none focus:border-blue-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Ticket quantity</label>
                <input type="number" required value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Allocation count" className="h-12 border-2 border-slate-200 rounded-xl px-4 text-sm bg-white outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Departure date & time</label>
              <input type="datetime-local" required value={departureTime} onChange={e => setDepartureTime(e.target.value)} className="h-12 border-2 border-slate-200 rounded-xl px-4 text-sm bg-white outline-none focus:border-blue-500" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">Perks (checkboxes)</label>
              <div className="flex flex-wrap gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {["AC", "Breakfast", "Wifi", "Sofa Seat"].map(p => (
                  <Checkbox key={p} isSelected={perks.includes(p)} onChange={(e) => e.target.checked ? setPerks([...perks, p]) : setPerks(perks.filter(item => item !== p))}>
                    <span className="text-xs font-semibold text-slate-600">{p}</span>
                  </Checkbox>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Image URL</label>
              <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="h-12 border-2 border-slate-200 rounded-xl px-4 text-sm bg-white outline-none focus:border-blue-500" />
            </div>

            <Button type="submit" className="w-full bg-blue-600 text-white font-bold h-12 rounded-xl">Add Ticket</Button>
          </form>
        )}

       
        {activeTab === "c" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">c) My Added Tickets</h2>
            {myTickets.length === 0 ? (
              <p className="text-sm text-slate-400 py-12 text-center">No added tickets to show.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {myTickets.map(ticket => {
                  const isRejected = ticket.verificationStatus === "rejected";
                  const statusColors = { pending: "bg-amber-100 text-amber-700", approved: "bg-emerald-100 text-emerald-700", rejected: "bg-rose-100 text-rose-700" };
                  
                  return (
                    <Card key={ticket._id} className="p-4 border border-slate-100 rounded-2xl flex flex-col justify-between gap-4 bg-white shadow-sm">
                      <div className="space-y-2">
                        <div className="h-28 w-full rounded-xl overflow-hidden bg-slate-50 border">
                          <img src={ticket.image || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600"} className="w-full h-full object-cover" alt="" />
                        </div>
                        <h3 className="font-bold text-slate-800 line-clamp-1">{ticket.title}</h3>
                        <div className="flex items-center text-[10px] text-slate-400 font-black gap-1">
                          <span>{ticket.from}</span> <ArrowRight size={10} /> <span>{ticket.to}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold">Quantity: {ticket.quantity}</p>
                        <p className="text-sm font-black text-blue-600">${ticket.price}.00</p>
                        <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wide uppercase ${statusColors[ticket.verificationStatus || "pending"]}`}>
                          Status: {ticket.verificationStatus || "pending"}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2 border-t">
                        <button disabled={isRejected} onClick={() => setEditingTicket(ticket)} className={`flex-1 font-bold h-9 bg-slate-100 rounded-xl text-xs flex items-center justify-center gap-1 text-slate-700 ${isRejected ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-200"}`}>
                          <Edit size={12} /> Update
                        </button>
                        <button disabled={isRejected} onClick={() => handleDeleteTicket(ticket._id)} className={`flex-1 font-bold h-9 bg-rose-50 text-rose-600 rounded-xl text-xs flex items-center justify-center gap-1 ${isRejected ? "opacity-30 cursor-not-allowed" : "hover:bg-rose-100"}`}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        
        {activeTab === "d" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">d) Requested Bookings</h2>
            {requestedBookings.length === 0 ? (
              <p className="text-sm text-slate-400 py-12 text-center">No matching user reservation items found.</p>
            ) : (
              <div className="overflow-x-auto border rounded-2xl">
                <table className="w-full text-left text-sm border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b text-xs uppercase tracking-wider">
                      <th className="p-4">User</th>
                      <th className="p-4">Ticket</th>
                      <th className="p-4">Qty</th>
                      <th className="p-4">Total Price</th>
                      <th className="p-4 text-center">Status / Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-600 font-semibold">
                    {requestedBookings.map(b => (
                      <tr key={b._id} className="hover:bg-slate-50/40">
                        <td className="p-4 text-xs font-mono">{b.userEmail || b.userName}</td>
                        <td className="p-4 font-bold text-slate-800">{b.ticketTitle || b.title}</td>
                        <td className="p-4">{b.quantity || b.bookingQuantity}</td>
                        <td className="p-4 font-extrabold text-blue-600">${b.totalPrice}.00</td>
                        <td className="p-4 flex justify-center items-center gap-2">
                          {b.status === "pending" || !b.status ? (
                            <>
                              <Button size="sm" onClick={() => handleBookingAction(b._id, "accepted")} className="bg-blue-600 text-white font-bold rounded-lg text-xs">Accept</Button>
                              <Button size="sm" variant="flat" color="danger" onClick={() => handleBookingAction(b._id, "rejected")} className="font-bold rounded-lg text-xs">Reject</Button>
                            </>
                          ) : b.status === "accepted" ? (
                            <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                              Accepted (Awaiting User Payment)
                            </span>
                          ) : (
                            <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${b.status === "paid" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{b.status}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      
        {activeTab === "e" && (() => {
          const paidBookings = requestedBookings.filter(b => b.status === "paid");
          const totalSoldQuantity = paidBookings.reduce((acc, curr) => acc + (parseInt(curr.quantity || curr.bookingQuantity) || 0), 0);
          const calculatedRevenue = paidBookings.reduce((acc, curr) => acc + (parseFloat(curr.totalPrice) || 0), 0);

          return (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-800">e) Revenue Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 border bg-slate-50 rounded-2xl space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Total Destinations Added</p>
                  <p className="text-3xl font-black text-slate-800">{myTickets.length}</p>
                </div>
                <div className="p-5 border bg-slate-50 rounded-2xl space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Total Tickets Sold</p>
                  <p className="text-3xl font-black text-emerald-600">{totalSoldQuantity}</p>
                </div>
                <div className="p-5 border bg-slate-50 rounded-2xl space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Total Revenue</p>
                  <p className="text-3xl font-black text-blue-600">${calculatedRevenue.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <p className="text-sm font-bold text-slate-700">Dynamic Progress Visual Charts</p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                      <span>Total Tickets Added Chart Matrix</span>
                      <span>{myTickets.length}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-6 rounded-lg overflow-hidden border">
                      <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${Math.min(100, (myTickets.length / 20) * 100)}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                      <span>Total Tickets Sold Chart Matrix</span>
                      <span>{totalSoldQuantity}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-6 rounded-lg overflow-hidden border">
                      <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${Math.min(100, (totalSoldQuantity / 20) * 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

       
        {editingTicket && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form onSubmit={handleUpdateTicket} className="bg-white max-w-md w-full p-6 rounded-2xl border space-y-4 shadow-2xl">
              <h3 className="font-bold text-lg text-slate-800">Update Ticket Details</h3>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Ticket title</label>
                <input required value={editingTicket.title || ""} onChange={e => setEditingTicket({...editingTicket, title: e.target.value})} className="h-10 border-2 rounded-xl px-3 text-sm bg-white outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Price</label>
                  <input 
                    type="number" 
                    required 
                    value={editingTicket.price === "" ? "" : editingTicket.price ?? ""} 
                    onChange={e => setEditingTicket({...editingTicket, price: e.target.value === "" ? "" : parseFloat(e.target.value)})} 
                    className="h-10 border-2 rounded-xl px-3 text-sm bg-white outline-none focus:border-blue-500" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Quantity</label>
                  <input 
                    type="number" 
                    required 
                    value={editingTicket.quantity === "" ? "" : editingTicket.quantity ?? ""} 
                    onChange={e => setEditingTicket({...editingTicket, quantity: e.target.value === "" ? "" : parseInt(e.target.value)})} 
                    className="h-10 border-2 rounded-xl px-3 text-sm bg-white outline-none focus:border-blue-500" 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button size="sm" variant="flat" onClick={() => setEditingTicket(null)}>Cancel</Button>
                <Button size="sm" type="submit" className="bg-blue-600 text-white font-bold">Save Modifications</Button>
              </div>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}