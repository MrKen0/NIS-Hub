import Link from 'next/link';

const links = [
  { label: 'Home', href: '/', icon: '🏠' },
  { label: 'Services', href: '/services', icon: '🔎' },
  { label: 'Create', href: '/create', icon: '➕' },
  { label: 'Events', href: '/events', icon: '📅' },
  { label: 'Notices', href: '/notices', icon: '📢' },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white text-slate-600 sm:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-around px-4 py-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="flex flex-col items-center text-xs font-semibold leading-none">
            <span className="mb-0.5 text-base">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
