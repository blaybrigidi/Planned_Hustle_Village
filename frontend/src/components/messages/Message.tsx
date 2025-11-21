import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Message as MessageType } from '@/hooks/useMessages';
import { useState } from 'react';

interface MessageProps {
  message: MessageType;
  senderName?: string;
  senderAvatar?: string;
}

export const Message = ({ message, senderName, senderAvatar }: MessageProps) => {
  const { user } = useAuth();
  const isOwnMessage = message.sender_id === user?.id;
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const attachments = message.attachments || [];
  const hasContent = message.content && message.content.trim().length > 0;
  const hasAttachments = attachments.length > 0;

  return (
    <div
      className={`flex gap-3 mb-4 ${
        isOwnMessage ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {!isOwnMessage && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {senderName ? getInitials(senderName) : '?'}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`flex flex-col max-w-[70%] ${
          isOwnMessage ? 'items-end' : 'items-start'
        }`}
      >
        {/* Attachments (Images) */}
        {hasAttachments && (
          <div className={`mb-2 ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
            {attachments.map((url, index) => (
              <div
                key={index}
                className={`rounded-lg overflow-hidden ${
                  isOwnMessage ? 'ml-auto' : 'mr-auto'
                }`}
                style={{ maxWidth: '300px' }}
              >
                {!imageError[index] ? (
                  <img
                    src={url}
                    alt={`Attachment ${index + 1}`}
                    className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onError={() => setImageError((prev) => ({ ...prev, [index]: true }))}
                    onClick={() => window.open(url, '_blank')}
                  />
                ) : (
                  <div className="p-4 bg-muted text-muted-foreground text-sm rounded-lg">
                    Failed to load image
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Text Content */}
        {hasContent && (
          <div
            className={`rounded-lg px-4 py-2 ${
              isOwnMessage
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {formatDistanceToNow(new Date(message.created_at), {
            addSuffix: true,
          })}
        </span>
      </div>
    </div>
  );
};

