import { Link } from 'react-router-dom';

const promises = [
  { number: '01', title: 'Clear costs', copy: 'See the rent, water, electricity, and other bills before you apply.' },
  { number: '02', title: 'Reviewed listings', copy: 'Every new room advertisement is reviewed by the Rento admin team.' },
  { number: '03', title: 'Direct applications', copy: 'Send your details straight to the room owner and track the response.' },
];

export default function AboutPage() {
  return <div className="space-y-12">
    <section className="overflow-hidden rounded-3xl bg-slate-950 px-7 py-12 text-white sm:px-12 sm:py-16">
      <p className="text-xs font-bold uppercase tracking-[.22em] text-indigo-300">A little about us</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">Moving for college is big. Finding a room should feel simple.</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">Rento helps students find a place to live for the semester, with room details and monthly costs in one clear listing.</p>
      <Link to="/rooms" className="mt-8 inline-flex rounded-xl bg-white px-5 py-3 font-bold text-slate-950 hover:bg-indigo-50">Explore available rooms</Link>
    </section>
    <section className="grid gap-4 md:grid-cols-3">{promises.map((item) => <article key={item.number} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><p className="text-sm font-black text-indigo-600">{item.number}</p><h2 className="mt-4 text-xl font-bold">{item.title}</h2><p className="mt-2 leading-7 text-slate-600">{item.copy}</p></article>)}</section>
    <section className="rounded-3xl bg-indigo-50 p-8 sm:flex sm:items-center sm:justify-between sm:p-10"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-700">For room owners</p><h2 className="mt-2 text-2xl font-bold">Reach students looking for a place to stay.</h2><p className="mt-2 text-slate-600">Create an owner account, get approved, then publish your room from your dashboard.</p></div><Link to="/register?role=owner" className="mt-5 inline-flex rounded-xl bg-indigo-700 px-5 py-3 font-semibold text-white hover:bg-indigo-800 sm:mt-0">Create owner account</Link></section>
  </div>;
}
