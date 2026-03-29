import { Listing } from '@/types/listing';
import StatusChip from './StatusChip';

interface Props {
  listing: Listing;
  isAdmin?: boolean;
  onModerate?: (id: string, status: 'approved' | 'rejected') => void;
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

const whatsappLink = (cell: string, text: string) => {
  const p = encodeURIComponent(text);
  return `https://wa.me/${cell.replace(/\D/g, '')}?text=${p}`;
};

export default function ListingCard({ listing, isAdmin, onModerate }: Props) {
  const expiresAt = new Date(listing.expiresAt);
  const today = new Date();
  const isExpired = today > expiresAt;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      {listing.isProduct && (
        <img
          alt={listing.title}
          src={listing.imageUrl}
          className="mb-3 h-40 w-full rounded-lg object-cover"
          loading="lazy"
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-900">{listing.title}</h3>
        <StatusChip status={listing.status} />
      </div>

      <p className="py-2 text-sm text-slate-600">{listing.description}</p>

      <ul className="space-y-1 text-sm leading-relaxed text-slate-600">
        <li><strong>Created:</strong> {formatDate(listing.createdAt)}</li>
        <li>
          <strong>Expires:</strong> {formatDate(listing.expiresAt)}{' '}
          {isExpired ? '(expired)' : ''}
        </li>
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>Author: {listing.authorId}</span>
        <span>Type: {listing.isProduct ? 'Product' : 'Service'}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={whatsappLink(listing.whatsapp, `Hello, I'm interested in ${listing.title}`)}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
        >
          WhatsApp
        </a>

        {isAdmin && listing.status === 'pending' && onModerate && (
          <>
            <button
              onClick={() => onModerate(listing.id, 'approved')}
              className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
            >
              Approve
            </button>
            <button
              onClick={() => onModerate(listing.id, 'rejected')}
              className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Reject
            </button>
          </>
        )}
      </div>
    </article>
  );
}
