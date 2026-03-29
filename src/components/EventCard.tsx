import { Event } from '@/types/listing';
import StatusChip from './StatusChip';

interface EventCardProps {
  event: Event;
  onRSVP?: (eventId: string) => void;
  onModerate?: (eventId: string, status: 'approved' | 'rejected') => void;
  isAdmin?: boolean;
  hasRSVPd?: boolean;
}

export default function EventCard({ event, onRSVP: _onRSVP, onModerate, isAdmin, hasRSVPd }: EventCardProps) {
  const eventDate = new Date(event.date);
  const isExpired = new Date(event.expiresAt) < new Date();
  const isPast = eventDate < new Date();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const whatsappLink = `https://wa.me/${event.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hi! I'm interested in attending "${event.title}" on ${formatDate(eventDate)} at ${formatTime(event.time)}.`
  )}`;

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${isExpired ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{event.title}</h3>
        <StatusChip status={event.status} />
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(eventDate)} at {formatTime(event.time)}
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {event.location}
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {event.category}
        </div>

        {event.maxAttendees && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            {event.rsvpCount}/{event.maxAttendees} attending
          </div>
        )}
      </div>

      <p className="text-gray-700 text-sm mb-4 line-clamp-3">{event.description}</p>

      <div className="flex gap-2">
        {!isPast && !isExpired && event.status === 'approved' && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium text-center hover:bg-green-700 transition-colors"
          >
            RSVP via WhatsApp
          </a>
        )}

        {isAdmin && event.status === 'pending' && (
          <div className="flex gap-2 flex-1">
            <button
              onClick={() => onModerate?.(event.id, 'approved')}
              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => onModerate?.(event.id, 'rejected')}
              className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Reject
            </button>
          </div>
        )}

        {hasRSVPd && (
          <span className="text-green-600 text-sm font-medium">✓ RSVP&apos;d</span>
        )}
      </div>

      {isExpired && (
        <div className="mt-2 text-xs text-red-600 font-medium">Event expired</div>
      )}
    </div>
  );
}