import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, getError } from '../api';

const currency = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function BrowseRooms() {
  const [params, setParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [query, setQuery] = useState(params.get('q') || '');
  const [city, setCity] = useState(params.get('city') || '');
  const [maxRent, setMaxRent] = useState(params.get('maxRent') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/rooms', { params: Object.fromEntries(params.entries()) })
      .then(({ data }) => { if (active) { setRooms(data); setError(''); } })
      .catch((e) => { if (active) setError(getError(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params]);

  const search = (event) => {
    event.preventDefault();
    const next = {};
    if (query.trim()) next.q = query.trim();
    if (city.trim()) next.city = city.trim();
    if (maxRent) next.maxRent = maxRent;
    setParams(next);
  };

  return <div className="space-y-8">
    <section className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200 sm:p-10">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-600">Verified student stays</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Browse rooms near your campus</h1>
      <p className="mt-3 max-w-2xl text-slate-600">Compare monthly rent, room size, features, and utility costs before you apply.</p>
      <form onSubmit={search} className="mt-7 grid gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200 md:grid-cols-[1fr_180px_180px_auto]">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Room type, area or keyword" className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-indigo-500" />
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-indigo-500" />
        <input value={maxRent} onChange={(e) => setMaxRent(e.target.value)} type="number" min="0" placeholder="Max rent / month" className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-indigo-500" />
        <button className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700">Search</button>
      </form>
    </section>

    <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-600">Find your fit</p><h2 className="mt-1 text-2xl font-bold">{loading ? 'Finding rooms…' : `${rooms.length} rooms available`}</h2></div><Link to="/" className="text-sm font-semibold text-indigo-700 hover:text-indigo-900">Back home</Link></div>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
    {!loading && rooms.length > 0 && <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{rooms.map((room) => <Link key={room._id} to={`/rooms/${room._id}`} className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl"><div className="relative"><img className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.03]" src={room.images?.[0] || 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1200'} alt={room.title} /><span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-indigo-800">{room.roomType}</span></div><div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="text-lg font-bold text-slate-950">{room.title}</h3><span className="shrink-0 text-right font-extrabold text-indigo-700">{currency(room.rent)}<small className="block text-xs font-medium text-slate-500">per month</small></span></div><p className="mt-1 text-sm text-slate-500">{room.area}, {room.city}</p><p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{room.description}</p><div className="mt-4 flex flex-wrap gap-2">{room.features?.slice(0, 3).map((feature) => <span key={feature} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{feature}</span>)}</div><div className="mt-4 flex justify-between border-t border-slate-100 pt-3 text-xs text-slate-500"><span>{room.size} m²</span><span>Water {room.utilities?.water}</span><span>Power {room.utilities?.electricity}</span></div></div></Link>)}</div>}
    {!loading && !error && rooms.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><h3 className="text-xl font-bold">No rooms found</h3><p className="mt-2 text-slate-500">Try a different city or raise your budget.</p><button onClick={() => { setQuery(''); setCity(''); setMaxRent(''); setParams({}); }} className="mt-5 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50">Clear filters</button></div>}
  </div>;
}
