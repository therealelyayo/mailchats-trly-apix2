import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { EmailConfiguration } from "@/pages/Home";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  config: EmailConfiguration;
  recipientCount: number;
}

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  config, 
  recipientCount 
}: ConfirmModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Email Campaign</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to send emails to <strong>{recipientCount}</strong> recipients.
            Please review the details below before proceeding:
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-muted-foreground">Sending Method:</span>
              <span className="font-medium">{config.sendMethod}</span>
            </li>
            
            {config.sendMethod === 'SMTP' && (
              <>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">SMTP Host:</span>
                  <span className="font-medium">{config.smtpHost || 'localhost'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">SMTP Port:</span>
                  <span className="font-medium">{config.smtpPort}</span>
                </li>
              </>
            )}
            
            <li className="flex justify-between">
              <span className="text-muted-foreground">From Name:</span>
              <span className="font-medium">{config.fromName}</span>
            </li>
            
            <li className="flex justify-between">
              <span className="text-muted-foreground">Send Speed:</span>
              <span className="font-medium">{config.sendSpeed} emails/second</span>
            </li>
            
            <li className="flex justify-between">
              <span className="text-muted-foreground">Track Opens:</span>
              <span className="font-medium">{config.trackOpens ? 'Yes' : 'No'}</span>
            </li>
            
            <li className="flex justify-between">
              <span className="text-muted-foreground">Track Links:</span>
              <span className="font-medium">{config.trackLinks ? 'Yes' : 'No'}</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md mb-4">
          <p className="text-sm font-medium">⚠️ Warning:</p>
          <p className="text-xs mt-1">
            This action will send real emails to the recipients in your list.
            Make sure your template and recipient list are correct before proceeding.
          </p>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Start Sending</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}