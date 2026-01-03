'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const statusColors: Record<string, string> = {
  open: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  resolved: 'bg-green-500',
  closed: 'bg-gray-500',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-500',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const { data: ticketResponse, isLoading } = useQuery({
    queryKey: ['admin-ticket', id],
    queryFn: () => supportApi.getTicketAdmin(id),
  });

  const ticket = ticketResponse?.data;

  const replyMutation = useMutation({
    mutationFn: (content: string) => supportApi.replyToTicket(id, { message: content }),
    onSuccess: () => {
      toast.success('Reply sent successfully');
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['admin-ticket', id] });
    },
    onError: () => {
      toast.error('Failed to send reply');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { status?: string; priority?: string }) =>
      supportApi.updateTicketAdmin(id, data),
    onSuccess: () => {
      toast.success('Ticket updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
    },
    onError: () => {
      toast.error('Failed to update ticket');
    },
  });

  const handleReply = () => {
    if (!message.trim()) return;
    replyMutation.mutate(message);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    updateMutation.mutate({ status: newStatus });
  };

  const handlePriorityChange = (newPriority: string) => {
    setPriority(newPriority);
    updateMutation.mutate({ priority: newPriority });
  };

  if (isLoading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container py-8">
        <p className="text-center text-muted-foreground">Ticket not found</p>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/support')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{ticket.subject}</h1>
            <p className="text-sm text-muted-foreground">#{String(ticket.id || '').slice(0, 8)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.messages?.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-lg ${
                    msg.isFromAdmin
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'bg-gray-50 border-l-4 border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">
                      {msg.isFromAdmin ? 'Support Team' : ticket.user?.name || ticket.user?.username}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(msg.createdAt)}</p>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Reply Form */}
          {String(ticket.status) !== 'closed' && String(ticket.status) !== 'resolved' && (
            <Card>
              <CardHeader>
                <CardTitle>Send Reply</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleReply}
                    disabled={!message.trim() || replyMutation.isPending}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Status</p>
                <Select
                  value={status || String(ticket.status)}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue>
                      <Badge className={statusColors[status || String(ticket.status)]}>
                        {String(status || ticket.status).replace('_', ' ')}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Priority</p>
                <Select
                  value={priority || String(ticket.priority)}
                  onValueChange={handlePriorityChange}
                >
                  <SelectTrigger>
                    <SelectValue>
                      <Badge variant="secondary" className={priorityColors[priority || String(ticket.priority)]}>
                        {priority || ticket.priority}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{formatDate(ticket.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="font-medium">{formatDate(ticket.updatedAt)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Messages</span>
                  <span className="font-medium">{ticket.messages?.length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{ticket.user?.name || ticket.user?.username}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{ticket.user?.email}</p>
              </div>
              {ticket.user?.id && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => router.push(`/admin/users/${ticket.user.id}`)}
                >
                  View User Profile
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {String(ticket.status) !== 'resolved' && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusChange('resolved')}
                  disabled={updateMutation.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Resolved
                </Button>
              )}
              {String(ticket.status) !== 'closed' && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusChange('closed')}
                  disabled={updateMutation.isPending}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Close Ticket
                </Button>
              )}
              {(String(ticket.status) === 'closed' || String(ticket.status) === 'resolved') && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusChange('open')}
                  disabled={updateMutation.isPending}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Reopen Ticket
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
