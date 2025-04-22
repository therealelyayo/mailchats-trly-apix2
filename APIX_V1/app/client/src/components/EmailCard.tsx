import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Send, Eye, MousePointer, MailQuestion } from 'lucide-react';

interface EmailCardProps {
  id: number;
  email: string;
  subject: string;
  sent: boolean;
  delivered: boolean;
  opened: boolean;
  clicked: boolean;
  replied: boolean;
  failed: boolean;
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  repliedAt?: Date;
  onResend?: (id: number) => void;
}

const formatDate = (date?: Date) => {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
};

export const EmailCard: React.FC<EmailCardProps> = ({
  id,
  email,
  subject,
  sent,
  delivered,
  opened,
  clicked,
  replied,
  failed,
  sentAt,
  openedAt,
  clickedAt,
  repliedAt,
  onResend
}) => {
  const getStatusBadge = () => {
    if (failed) {
      return <Badge variant="destructive" className="ml-2">Failed</Badge>;
    }
    if (replied) {
      return <Badge variant="default" className="bg-blue-500 ml-2">Replied</Badge>;
    }
    if (clicked) {
      return <Badge variant="default" className="bg-green-600 ml-2">Clicked</Badge>;
    }
    if (opened) {
      return <Badge variant="default" className="bg-amber-500 ml-2">Opened</Badge>;
    }
    if (delivered) {
      return <Badge variant="default" className="bg-emerald-500 ml-2">Delivered</Badge>;
    }
    if (sent) {
      return <Badge variant="default" className="bg-violet-500 ml-2">Sent</Badge>;
    }
    return <Badge variant="outline" className="ml-2">Pending</Badge>;
  };

  return (
    <Card className="w-full border shadow-sm hover:shadow transition-shadow duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="truncate" title={email}>
            {email}
          </span>
          {getStatusBadge()}
        </CardTitle>
        <CardDescription className="truncate" title={subject}>
          {subject}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 pb-2">
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          {sent && (
            <div className="flex items-center gap-1">
              <Send className="h-3 w-3" /> <span>Sent: {formatDate(sentAt)}</span>
            </div>
          )}
          {opened && (
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> <span>Opened: {formatDate(openedAt)}</span>
            </div>
          )}
          {clicked && (
            <div className="flex items-center gap-1">
              <MousePointer className="h-3 w-3" /> <span>Clicked: {formatDate(clickedAt)}</span>
            </div>
          )}
          {replied && (
            <div className="flex items-center gap-1">
              <MailQuestion className="h-3 w-3" /> <span>Replied: {formatDate(repliedAt)}</span>
            </div>
          )}
          {!sent && !failed && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> <span>Scheduled</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        {failed && onResend && (
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs"
            onClick={() => onResend(id)}
            data-testid={`resend-button-${id}`}
          >
            Resend Email
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};