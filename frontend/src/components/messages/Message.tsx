import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Message as MessageType } from '@/hooks/useMessages';

interface MessageProps {
  message: MessageType;
  senderName?: string;
  senderAvatar?: string;
}

export const Message = ({ message, senderName, senderAvatar }: MessageProps) => {
  const { user } = useAuth();
  const isOwnMessage = message.sender_id === user?.id;

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {formatDistanceToNow(new Date(message.created_at), {
            addSuffix: true,
          })}
        </span>
      </div>
    </div>
  );
};

