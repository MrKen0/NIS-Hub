import { Notice } from '@/types/listing';
import StatusChip from './StatusChip';

interface NoticeCardProps {
  notice: Notice;
  onModerate?: (noticeId: string, status: 'approved' | 'rejected') => void;
  isAdmin?: boolean;
}

export default function NoticeCard({ notice, onModerate, isAdmin }: NoticeCardProps) {
  const isExpired = new Date(notice.expiresAt) < new Date();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'announcement': return '📢';
      case 'alert': return '⚠️';
      case 'opportunity': return '💡';
      case 'general': return '📋';
      default: return '📄';
    }
  };

  const whatsappLink = notice.whatsapp ? `https://wa.me/${notice.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hi! I saw your notice "${notice.title}" and would like to discuss.`
  )}` : null;

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${isExpired ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCategoryIcon(notice.category)}</span>
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{notice.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notice.priority)}`}>
            {notice.priority.toUpperCase()}
          </span>
          <StatusChip status={notice.status} />
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Posted {formatDate(notice.createdAt)}
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {notice.viewCount} views
        </div>
      </div>

      <p className="text-gray-700 text-sm mb-4 line-clamp-3">{notice.content}</p>

      <div className="flex gap-2">
        {whatsappLink && notice.status === 'approved' && !isExpired && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium text-center hover:bg-green-700 transition-colors"
          >
            Contact via WhatsApp
          </a>
        )}

        {isAdmin && notice.status === 'pending' && (
          <div className="flex gap-2 flex-1">
            <button
              onClick={() => onModerate?.(notice.id, 'approved')}
              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => onModerate?.(notice.id, 'rejected')}
              className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {isExpired && (
        <div className="mt-2 text-xs text-red-600 font-medium">Notice expired</div>
      )}
    </div>
  );
}