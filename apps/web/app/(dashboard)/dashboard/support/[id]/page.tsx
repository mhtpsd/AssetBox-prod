'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supportApi } from '@/lib/api';
import { formatDate, getInitials } from '@/lib/utils';

interface Props {
  params: { id: string };
}

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

export default function TicketDetailPage({ params }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');

  const { data:  ticket, isLoading } = useQuery({
    queryKey: ['support-ticket', params.id],
    queryFn: async () => {
      const response = await supportApi.getTicket(params. id);
      return response.data;
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      await supportApi.sendMessage(params. id, { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-ticket', params.id] });
      setMessage('');
      toast.success('Message sent');
    },
    onError:  () => {
      toast.error('Failed to send message');
    },
  });

  const closeTicketMutation = useMutation({
    mutationFn: async () => {
      await supportApi. updateTicket(params.id, { status: 'CLOSED' });
    },
    onSuccess:  () => {
      queryClient. invalidateQueries({ queryKey:  ['support-ticket', params.id] });
      toast.success('Ticket closed');
    },
    onError:  () => {
      toast.error('Failed to close ticket');
    },
  });

  const handleSendMessage = () => {
    if (message.trim().length < 1) {
      toast.error('Please enter a message');
      return;
    }
    sendMessageMutation.mutate(message);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Ticket not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/support')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{ticket.subject}</h1>
              <Badge className={statusColors[ticket.status]}>
                {ticket.status.replace('_', ' ')}
              </Badge>
              <Badge variant="secondary">{ticket.priority}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Ticket #{ticket.id.slice(0, 8)} • Created {formatDate(ticket.createdAt)}
            </p>
          </div>
        </div>
        {ticket.status !== 'CLOSED' && (
          <Button
            variant="outline"
            onClick={() => closeTicketMutation.mutate()}
            disabled={closeTicketMutation.isPending}
          >
            Close Ticket
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="rounded-lg border bg-card">
        <ScrollArea className="h-[500px] p-6">
          <div className="space-y-6">
            {ticket.messages?. map((msg: any, index: number) => (
              <div key={msg.id}>
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={msg.user?. image || undefined} />
                    <AvatarFallback>
                      {getInitials(msg.user?.name || msg.user?.username || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {msg.user?. name || msg.user?.username}
                      </p>
                      {msg.isAdminReply && (
                        <Badge variant="secondary" className="text-xs">
                          Support Team
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm">{msg.message}</p>
                  </div>
                </div>
                {index < ticket.messages.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Reply Box */}
        {ticket.status !== 'CLOSED' && (
          <div className="border-t p-4">
            <div className="space-y-4">
              <Textarea
                placeholder="Type your message here..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isPending || ! message.trim()}
                >
                  {sendMessageMutation.isPending ?  (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}