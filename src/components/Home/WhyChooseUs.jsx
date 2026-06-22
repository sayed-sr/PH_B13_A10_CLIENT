import { ShieldCheck, Clock, CreditCard, Headset } from "lucide-react";

export default function WhyChooseUs() {
  const features = [
    { icon: <ShieldCheck size={32} className="text-blue-600" />, title: "Secure Booking", desc: "Your payments and personal data are fully protected." },
    { icon: <Clock size={32} className="text-blue-600" />, title: "Instant Tickets", desc: "Get your digital tickets immediately after payment." },
    { icon: <CreditCard size={32} className="text-blue-600" />, title: "Easy Payment", desc: "Pay seamlessly using Stripe with any major card." },
    { icon: <Headset size={32} className="text-blue-600" />, title: "24/7 Support", desc: "Our customer service team is always here to help." }
  ];

  return (
    <section className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-800">Why Choose TicketBari?</h2>
        <p className="text-slate-500 mt-2">The best transport ticketing experience in Bangladesh.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f, i) => (
          <div key={i} className="text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-110">
              {f.icon}
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{f.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}