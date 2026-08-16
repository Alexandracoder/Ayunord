import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  Clock3,
  Download,
  HeartHandshake,
  Instagram,
  MapPin,
  Menu,
  MessageCircle,
  Megaphone,
  MoveUpRight,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Volunteer = {
  id: string;
  name: string;
  zone: string;
  support_type: string;
  availability: string;
  created_at: string;
};

type CommunityGroup = {
  id: string;
  name: string;
  zone: string;
  coordinator: string;
  contact: string;
  purpose: string;
  members_count: number;
};

type ModalType = 'volunteer' | 'group' | null;

const supportOptions = ['Flyers y diseño', 'Logística', 'Comunicación', 'Oración y acompañamiento', 'Donaciones', 'Transporte'];
const zones = ['Santo Domingo Este', 'Santo Domingo Norte', 'Santo Domingo Oeste', 'Distrito Nacional', 'Santiago', 'San Cristóbal', 'Otra zona'];
const targetDate = new Date('2026-09-20T08:00:00-04:00');

function App() {
  const [modal, setModal] = useState<ModalType>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [daysLeft, setDaysLeft] = useState(0);

  const volunteerCount = useMemo(() => Math.max(128, volunteers.length + 128), [volunteers.length]);
  const groupCount = useMemo(() => Math.max(12, groups.length + 12), [groups.length]);

  useEffect(() => {
    const updateCountdown = () => setDaysLeft(Math.max(0, Math.ceil((targetDate.getTime() - Date.now()) / 86400000)));
    updateCountdown();
    const interval = window.setInterval(updateCountdown, 60000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadCoordination = async () => {
      const [{ data: groupData }, { data: volunteerData }] = await Promise.all([
        supabase.from('community_groups').select('*').order('created_at', { ascending: false }).limit(6),
        supabase.from('volunteers').select('id, name, zone, support_type, availability, created_at').order('created_at', { ascending: false }).limit(100),
      ]);
      setGroups(groupData ?? []);
      setVolunteers(volunteerData ?? []);
      setLoadingGroups(false);
    };
    void loadCoordination();
  }, []);

  const closeModal = () => {
    setModal(null);
    setSubmitStatus('idle');
  };

  const handleVolunteerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus('sending');
    const form = new FormData(event.currentTarget);
    const { error } = await supabase.from('volunteers').insert({
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      phone: String(form.get('phone') ?? '') || null,
      zone: String(form.get('zone') ?? ''),
      support_type: String(form.get('support_type') ?? ''),
      availability: String(form.get('availability') ?? ''),
      message: String(form.get('message') ?? '') || null,
    });
    if (error) {
      setSubmitStatus('error');
      return;
    }
    setSubmitStatus('success');
    setVolunteers((current) => [...current, { id: crypto.randomUUID(), name: String(form.get('name')), zone: String(form.get('zone')), support_type: String(form.get('support_type')), availability: String(form.get('availability')), created_at: new Date().toISOString() }]);
  };

  const handleGroupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus('sending');
    const form = new FormData(event.currentTarget);
    const group = {
      name: String(form.get('name') ?? ''),
      zone: String(form.get('zone') ?? ''),
      coordinator: String(form.get('coordinator') ?? ''),
      contact: String(form.get('contact') ?? ''),
      purpose: String(form.get('purpose') ?? ''),
      members_count: Number(form.get('members_count') ?? 1),
    };
    const { data, error } = await supabase.from('community_groups').insert(group).select().maybeSingle();
    if (error) {
      setSubmitStatus('error');
      return;
    }
    setSubmitStatus('success');
    if (data) setGroups((current) => [data, ...current]);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f7f2] text-[#173b3a]">
      <header className="absolute left-0 right-0 top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <button onClick={() => scrollTo('inicio')} className="flex items-center gap-3 text-left" aria-label="Ir al inicio">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f4b63f] text-[#173b3a] shadow-lg shadow-[#173b3a]/10"><Sparkles size={21} strokeWidth={2.5} /></span>
            <span className="font-display text-lg font-bold leading-none tracking-tight text-white">40 días<br /><span className="text-[#f4b63f]">por la paz</span></span>
          </button>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-white/85 lg:flex">
            <button onClick={() => scrollTo('por-que')}>Por qué ahora</button>
            <button onClick={() => scrollTo('como-ayudar')}>Cómo ayudar</button>
            <button onClick={() => scrollTo('grupos')}>Grupos</button>
            <button onClick={() => scrollTo('marcha')}>La marcha</button>
          </nav>
          <button onClick={() => setModal('volunteer')} className="hidden items-center gap-2 rounded-full bg-[#f4b63f] px-5 py-3 text-sm font-bold text-[#173b3a] transition hover:bg-white lg:flex">Quiero colaborar <ArrowRight size={16} /></button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-full bg-white/10 p-3 text-white lg:hidden" aria-label="Abrir menú">{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
        {menuOpen && <div className="mx-4 rounded-2xl bg-[#173b3a] p-5 shadow-xl lg:hidden"><div className="grid gap-4 text-sm font-semibold text-white"><button onClick={() => scrollTo('por-que')}>Por qué ahora</button><button onClick={() => scrollTo('como-ayudar')}>Cómo ayudar</button><button onClick={() => scrollTo('grupos')}>Grupos</button><button onClick={() => scrollTo('marcha')}>La marcha</button><button onClick={() => { setModal('volunteer'); setMenuOpen(false); }} className="rounded-full bg-[#f4b63f] px-4 py-3 text-[#173b3a]">Quiero colaborar</button></div></div>}
      </header>

      <main>
        <section id="inicio" className="relative min-h-[720px] overflow-hidden bg-[#195b57] pb-20 pt-36 lg:min-h-[760px] lg:pt-44">
          <div className="absolute -right-32 top-24 h-[520px] w-[520px] rounded-full border border-white/10" /><div className="absolute -right-12 top-40 h-[360px] w-[360px] rounded-full border border-white/10" /><div className="absolute -bottom-40 -left-20 h-[440px] w-[440px] rounded-full bg-[#24706a]/60 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1.1fr_.9fr] lg:px-10">
            <div className="max-w-2xl"><div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-[#f4b63f]"><span className="h-2 w-2 rounded-full bg-[#f4b63f]" /> República Dominicana se une</div><h1 className="font-display text-5xl font-bold leading-[.94] tracking-[-.045em] text-white sm:text-7xl lg:text-[88px]">Un país que<br /><span className="text-[#f4b63f]">ora y actúa.</span></h1><p className="mt-8 max-w-lg text-lg leading-8 text-white/75">40 días de ayuno, oración y servicio para preparar una gran marcha por la paz, la unidad y la esperanza de nuestra nación.</p><div className="mt-10 flex flex-col gap-3 sm:flex-row"><button onClick={() => setModal('volunteer')} className="group flex items-center justify-center gap-3 rounded-full bg-[#f4b63f] px-6 py-4 font-bold text-[#173b3a] transition hover:-translate-y-1 hover:bg-white">Súmate a la misión <ArrowRight size={18} className="transition group-hover:translate-x-1" /></button><button onClick={() => scrollTo('marcha')} className="flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-4 font-bold text-white transition hover:border-[#f4b63f] hover:text-[#f4b63f]">Conoce la marcha <MoveUpRight size={17} /></button></div></div>
            <div className="relative mx-auto w-full max-w-[420px] lg:ml-auto"><div className="absolute -left-8 top-14 z-10 flex -rotate-6 items-center gap-3 rounded-2xl bg-[#f4b63f] px-4 py-3 shadow-xl shadow-black/10"><CalendarDays size={20} /><div><p className="text-[10px] font-bold uppercase tracking-wider">Gran marcha</p><p className="font-display text-lg font-bold">20 septiembre</p></div></div><div className="relative overflow-hidden rounded-[42%_42%_18%_18%] border-8 border-white/10 bg-[#dfe9df] p-8 pt-14 shadow-2xl shadow-black/20"><div className="mx-auto flex aspect-square max-w-[280px] items-center justify-center rounded-full border-[18px] border-[#f4b63f] bg-[#f8f7f2] shadow-inner"><div className="text-center"><p className="font-display text-7xl font-bold leading-none text-[#195b57]">{daysLeft}</p><p className="mt-2 text-xs font-bold uppercase tracking-[.2em] text-[#195b57]/60">días faltan</p></div></div><div className="mt-8 text-center"><p className="font-display text-2xl font-bold text-[#173b3a]">El tiempo es ahora</p><p className="mt-1 text-sm text-[#173b3a]/60">Cada acción cuenta.</p></div></div><div className="absolute -bottom-7 -right-5 rounded-2xl bg-white px-5 py-4 shadow-xl"><p className="text-[10px] font-bold uppercase tracking-widest text-[#195b57]/50">Faro a Colón</p><p className="mt-1 flex items-center gap-1 font-display text-lg font-bold text-[#173b3a]"><MapPin size={16} className="text-[#e47445]" /> Santo Domingo Este</p></div></div>
          </div>
        </section>

        <section id="por-que" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32"><div className="grid gap-14 lg:grid-cols-[.75fr_1.25fr] lg:items-end"><div><p className="mb-5 text-xs font-bold uppercase tracking-[.2em] text-[#e47445]">Una causa que nos une</p><h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-[#173b3a] sm:text-5xl">La esperanza también se organiza.</h2></div><p className="max-w-xl text-lg leading-8 text-[#173b3a]/65">Este ayuno es una invitación a detenernos, escuchar y movernos juntos. No tienes que hacerlo todo: encuentra tu manera de sumar y conecta con personas cerca de ti.</p></div><div className="mt-16 grid gap-5 md:grid-cols-3"><InfoCard icon={<HeartHandshake />} number="01" title="Ayuno y oración" text="40 días para elevar una intención común por nuestra tierra y nuestras familias." color="yellow" /><InfoCard icon={<Users />} number="02" title="Comunidad activa" text="Organiza o encuentra un grupo en tu zona para que nadie camine solo." color="green" /><InfoCard icon={<Megaphone />} number="03" title="Acción visible" text="Lleva el mensaje a cada esquina con flyers, comunicación y servicio." color="coral" /></div></section>

        <section id="como-ayudar" className="bg-[#e6eee5] px-6 py-24 lg:px-10 lg:py-28"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="mb-5 text-xs font-bold uppercase tracking-[.2em] text-[#e47445]">Tu lugar está aquí</p><h2 className="font-display text-4xl font-bold tracking-tight text-[#173b3a] sm:text-5xl">Hay muchas formas<br />de hacerlo posible.</h2></div><button onClick={() => setModal('volunteer')} className="flex w-fit items-center gap-2 rounded-full bg-[#173b3a] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e47445]">Ver todas las opciones <ArrowRight size={16} /></button></div><div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{supportOptions.map((option, index) => <button key={option} onClick={() => setModal('volunteer')} className="group flex min-h-[190px] flex-col justify-between rounded-3xl bg-white p-6 text-left transition hover:-translate-y-1 hover:shadow-xl"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f8f7f2] text-[#195b57] transition group-hover:bg-[#f4b63f]"><SupportIcon index={index} /></span><span><span className="flex items-center justify-between font-display text-xl font-bold text-[#173b3a]">{option}<ArrowRight size={18} className="text-[#e47445] transition group-hover:translate-x-1" /></span><span className="mt-2 block text-sm leading-6 text-[#173b3a]/55">{supportDescription(index)}</span></span></button>)}</div></div></section>

        <section id="marcha" className="bg-[#173b3a] px-6 py-24 text-white lg:px-10 lg:py-28"><div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[.9fr_1.1fr] lg:items-center"><div><p className="mb-5 text-xs font-bold uppercase tracking-[.2em] text-[#f4b63f]">Reserva la fecha</p><h2 className="font-display text-5xl font-bold leading-[.95] tracking-tight sm:text-7xl">Nos vemos<br /><span className="text-[#f4b63f]">en el Faro.</span></h2><p className="mt-8 max-w-md text-lg leading-8 text-white/65">El cierre de estos 40 días será una gran marcha familiar por la paz. Ven con tu grupo, tu cartel y el corazón dispuesto.</p><button onClick={() => setModal('volunteer')} className="mt-9 flex items-center gap-3 rounded-full bg-[#f4b63f] px-6 py-4 font-bold text-[#173b3a] transition hover:bg-white">Quiero ser parte <ArrowRight size={18} /></button></div><div className="relative"><div className="absolute -left-4 -top-8 z-10 rounded-2xl bg-[#e47445] px-5 py-4 text-white shadow-xl"><p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Domingo</p><p className="font-display text-2xl font-bold">20.09.26</p></div><div className="overflow-hidden rounded-[32px] bg-[#28706a] p-8"><div className="flex min-h-[310px] flex-col justify-end rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_30%,#f4b63f_0_8%,transparent_8.5%),linear-gradient(160deg,#28706a_0%,#19504e_65%,#123e40_100%)] p-7"><div className="mb-5 flex items-end justify-center gap-2 text-[#f4b63f]"><div className="h-20 w-4 rounded-t-full bg-current" /><div className="h-28 w-5 rounded-t-full bg-current" /><div className="h-24 w-4 rounded-t-full bg-current" /><div className="h-36 w-6 rounded-t-full bg-current" /><div className="h-20 w-4 rounded-t-full bg-current" /></div><div className="h-2 rounded-full bg-[#f4b63f]" /><p className="mt-5 text-center font-display text-2xl font-bold">Una voz. Muchas manos.</p></div></div><p className="mt-5 flex items-center gap-2 text-sm text-white/50"><MapPin size={15} className="text-[#f4b63f]" /> Faro a Colón · Santo Domingo Este</p></div></div></section>

        <section id="grupos" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-5 text-xs font-bold uppercase tracking-[.2em] text-[#e47445]">Organización local</p><h2 className="font-display text-4xl font-bold tracking-tight text-[#173b3a] sm:text-5xl">Grupos que ya<br />están caminando.</h2></div><button onClick={() => setModal('group')} className="flex w-fit items-center gap-2 rounded-full border-2 border-[#173b3a] px-5 py-3 text-sm font-bold text-[#173b3a] transition hover:bg-[#173b3a] hover:text-white">Crear un grupo <Users size={17} /></button></div><div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{loadingGroups ? <p className="text-[#173b3a]/60">Cargando grupos...</p> : groups.length > 0 ? groups.map((group) => <div key={group.id} className="rounded-3xl border border-[#173b3a]/10 bg-white p-6"><div className="flex items-start justify-between gap-3"><span className="rounded-full bg-[#e6eee5] px-3 py-1 text-xs font-bold text-[#195b57]">{group.zone}</span><span className="text-xs font-bold text-[#173b3a]/40">{group.members_count} {group.members_count === 1 ? 'persona' : 'personas'}</span></div><h3 className="mt-5 font-display text-2xl font-bold">{group.name}</h3><p className="mt-2 text-sm leading-6 text-[#173b3a]/60">{group.purpose}</p><p className="mt-5 border-t border-[#173b3a]/10 pt-4 text-xs font-bold text-[#173b3a]/50">Coordina {group.coordinator}</p></div>) : <EmptyGroups onCreate={() => setModal('group')} />}</div></section>

        <section className="border-t border-[#173b3a]/10 bg-[#f4b63f] px-6 py-20 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 md:flex-row md:items-center"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#173b3a]/60">La red sigue creciendo</p><p className="mt-3 font-display text-4xl font-bold tracking-tight text-[#173b3a]">Ya somos {volunteerCount}+ voluntarios<br className="hidden sm:block" /> y {groupCount} grupos activos.</p></div><button onClick={() => setModal('volunteer')} className="flex items-center gap-2 rounded-full bg-[#173b3a] px-6 py-4 font-bold text-white transition hover:bg-white hover:text-[#173b3a]">Súmate hoy <ArrowRight size={18} /></button></div></section>
      </main>

      <footer className="bg-[#173b3a] px-6 py-12 text-white lg:px-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-end"><div><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4b63f] text-[#173b3a]"><Sparkles size={17} /></span><span className="font-display text-lg font-bold">40 días por la paz</span></div><p className="mt-5 max-w-xs text-sm leading-6 text-white/50">Una iniciativa ciudadana por la unidad, la oración y la acción.</p></div><div className="flex items-center gap-5 text-white/60"><a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="transition hover:text-[#f4b63f]"><Instagram size={20} /></a><a href="https://wa.me/18090000000" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="transition hover:text-[#f4b63f]"><MessageCircle size={20} /></a><span className="text-xs">República Dominicana · 2026</span></div></div></footer>

      {modal && <Modal type={modal} onClose={closeModal} onVolunteerSubmit={handleVolunteerSubmit} onGroupSubmit={handleGroupSubmit} status={submitStatus} />}
    </div>
  );
}

function InfoCard({ icon, number, title, text, color }: { icon: React.ReactNode; number: string; title: string; text: string; color: 'yellow' | 'green' | 'coral' }) {
  const colors = { yellow: 'bg-[#fff3d7]', green: 'bg-[#e6eee5]', coral: 'bg-[#fce5dc]' };
  return <div className={`rounded-3xl p-7 ${colors[color]}`}><div className="flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#195b57]">{icon}</span><span className="font-display text-4xl font-bold text-[#173b3a]/15">{number}</span></div><h3 className="mt-12 font-display text-2xl font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-[#173b3a]/60">{text}</p></div>;
}

function SupportIcon({ index }: { index: number }) { const icons = [<Download size={20} />, <ClipboardList size={20} />, <Megaphone size={20} />, <HeartHandshake size={20} />, <Sparkles size={20} />, <MapPin size={20} />]; return icons[index]; }
function supportDescription(index: number) { return ['Diseña, imprime y reparte el mensaje en tu comunidad.', 'Ayuda a coordinar rutas, horarios y el día de la marcha.', 'Comparte la causa y ayúdanos a llegar a más personas.', 'Acompaña el ayuno con presencia, escucha y oración.', 'Conecta recursos con las necesidades de los grupos.', 'Apoya a quienes necesitan llegar juntos al Faro.'][index]; }
function EmptyGroups({ onCreate }: { onCreate: () => void }) { return <div className="rounded-3xl border border-dashed border-[#173b3a]/20 p-8 md:col-span-2 lg:col-span-3"><p className="font-display text-xl font-bold">Sé de los primeros en organizarse.</p><p className="mt-2 text-sm text-[#173b3a]/60">Todavía no hay grupos publicados. Crea el primero en tu zona.</p><button onClick={onCreate} className="mt-5 flex items-center gap-2 font-bold text-[#e47445]">Crear mi grupo <ArrowRight size={16} /></button></div>; }

function Modal({ type, onClose, onVolunteerSubmit, onGroupSubmit, status }: { type: Exclude<ModalType, null>; onClose: () => void; onVolunteerSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>; onGroupSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>; status: 'idle' | 'sending' | 'success' | 'error' }) {
  const isVolunteer = type === 'volunteer';
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#173b3a]/70 p-0 backdrop-blur-sm sm:items-center sm:p-5"><div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[32px] bg-[#f8f7f2] p-6 sm:rounded-[32px] sm:p-9"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#e47445]">{isVolunteer ? 'Súmate a la red' : 'Organiza tu zona'}</p><h2 className="mt-2 font-display text-3xl font-bold text-[#173b3a]">{isVolunteer ? 'Quiero colaborar' : 'Crear un grupo'}</h2></div><button onClick={onClose} className="rounded-full bg-[#173b3a]/10 p-2 text-[#173b3a]" aria-label="Cerrar"><X size={20} /></button></div>{status === 'success' ? <div className="py-14 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d9ecda] text-[#195b57]"><Check size={32} /></div><h3 className="mt-6 font-display text-2xl font-bold">¡Ya estás dentro!</h3><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#173b3a]/60">Gracias por dar el paso. Tu participación ya forma parte de esta red de esperanza.</p><button onClick={onClose} className="mt-7 rounded-full bg-[#173b3a] px-6 py-3 text-sm font-bold text-white">Cerrar</button></div> : <form onSubmit={isVolunteer ? onVolunteerSubmit : onGroupSubmit} className="mt-8 grid gap-4"><div className="grid gap-4 sm:grid-cols-2"><Field label={isVolunteer ? 'Tu nombre' : 'Nombre del grupo'} name={isVolunteer ? 'name' : 'name'} required placeholder={isVolunteer ? 'Nombre completo' : 'Ej. Jóvenes por la paz'} /><Field label={isVolunteer ? 'Correo electrónico' : 'Tu nombre'} name={isVolunteer ? 'email' : 'coordinator'} type={isVolunteer ? 'email' : 'text'} required placeholder={isVolunteer ? 'correo@ejemplo.com' : 'Nombre del coordinador'} /></div>{isVolunteer ? <><div className="grid gap-4 sm:grid-cols-2"><Field label="Teléfono / WhatsApp" name="phone" placeholder="809 000 0000" /><SelectField label="Tu zona" name="zone" options={zones} /></div><div className="grid gap-4 sm:grid-cols-2"><SelectField label="Quiero ayudar con" name="support_type" options={supportOptions} /><SelectField label="Disponibilidad" name="availability" options={['Entre semana', 'Fines de semana', 'Ambos']} /></div><TextArea label="¿Hay algo más que quieras contarnos?" name="message" placeholder="Tu experiencia, una idea o cómo te gustaría participar..." /></> : <><div className="grid gap-4 sm:grid-cols-2"><SelectField label="Zona del grupo" name="zone" options={zones} /><Field label="Cantidad de personas" name="members_count" type="number" min="1" defaultValue="1" required placeholder="1" /></div><Field label="Contacto del grupo (correo o WhatsApp)" name="contact" required placeholder="correo@ejemplo.com o 809..." /><TextArea label="¿Qué quieren organizar?" name="purpose" required placeholder="Describe brevemente el propósito de tu grupo..." /></>} {status === 'error' && <p className="rounded-xl bg-[#fce5dc] px-4 py-3 text-sm font-semibold text-[#9b412a]">No pudimos guardar tu registro. Revisa los datos e inténtalo de nuevo.</p>}<button disabled={status === 'sending'} className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#173b3a] px-6 py-4 font-bold text-white transition hover:bg-[#e47445] disabled:opacity-50">{status === 'sending' ? 'Guardando...' : isVolunteer ? 'Confirmar mi colaboración' : 'Publicar mi grupo'} <ArrowRight size={18} /></button></form>}</div></div>;
}
function Field({ label, name, type = 'text', required = false, placeholder, min, defaultValue }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string; min?: string; defaultValue?: string }) { return <label className="grid gap-2 text-sm font-bold text-[#173b3a]"><span>{label}{required && <span className="text-[#e47445]"> *</span>}</span><input name={name} type={type} min={min} defaultValue={defaultValue} required={required} placeholder={placeholder} className="w-full rounded-2xl border border-[#173b3a]/15 bg-white px-4 py-3.5 font-normal outline-none transition placeholder:text-[#173b3a]/30 focus:border-[#195b57] focus:ring-2 focus:ring-[#195b57]/10" /></label>; }
function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) { return <label className="grid gap-2 text-sm font-bold text-[#173b3a]"><span>{label}<span className="text-[#e47445]"> *</span></span><span className="relative"><select name={name} required defaultValue="" className="w-full appearance-none rounded-2xl border border-[#173b3a]/15 bg-white px-4 py-3.5 font-normal outline-none transition focus:border-[#195b57] focus:ring-2 focus:ring-[#195b57]/10"><option value="" disabled>Selecciona una opción</option>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={17} className="pointer-events-none absolute right-4 top-4 text-[#173b3a]/50" /></span></label>; }
function TextArea({ label, name, required = false, placeholder }: { label: string; name: string; required?: boolean; placeholder: string }) { return <label className="grid gap-2 text-sm font-bold text-[#173b3a]"><span>{label}{required && <span className="text-[#e47445]"> *</span>}</span><textarea name={name} required={required} rows={3} placeholder={placeholder} className="w-full resize-none rounded-2xl border border-[#173b3a]/15 bg-white px-4 py-3.5 font-normal outline-none transition placeholder:text-[#173b3a]/30 focus:border-[#195b57] focus:ring-2 focus:ring-[#195b57]/10" /></label>; }

export default App;
