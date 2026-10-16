import { Link } from 'react-router-dom';

const reviews = [
  { name: 'Aarav Mehta', college: 'Student, Bengaluru', rating: 5, text: 'I could compare the monthly rent and electricity before reaching out. It made shortlisting rooms much less stressful.' },
  { name: 'Diya Nair', college: 'Student, Pune', rating: 5, text: 'The room details were easy to understand, and I could apply directly to the owner instead of chasing listings.' },
  { name: 'Kabir Shah', college: 'Student, Delhi', rating: 4, text: 'I found options close to campus and knew what was included in the rent. The application updates were helpful.' },
];

export default function ReviewPage() {
  return <div className="mx-auto max-w-5xl space-y-10">
    <header className="text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-600">Student stories</p><h1 className="mt-2 text-4xl font-black tracking-tight">A better start to the semester</h1><p className="mx-auto mt-3 max-w-2xl text-slate-600">A few words from students who used Rento to compare places and contact room owners.</p></header>
    <section className="grid gap-5 md:grid-cols-3">{reviews.map((review) => <article key={review.name} className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><div aria-label={`${review.rating} out of 5 stars`} className="text-lg tracking-widest text-amber-500">{'★'.repeat(review.rating)}<span className="text-slate-200">{'★'.repeat(5-review.rating)}</span></div><p className="mt-4 flex-1 text-lg leading-8 text-slate-700">“{review.text}”</p><div className="mt-6 border-t border-slate-100 pt-4"><p className="font-bold text-slate-950">{review.name}</p><p className="text-sm text-slate-500">{review.college}</p></div></article>)}</section>
    <div className="rounded-2xl bg-slate-950 p-8 text-center text-white"><h2 className="text-2xl font-bold">Ready to find your next room?</h2><Link to="/rooms" className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-indigo-50">Browse rooms</Link></div>
  </div>;
}
