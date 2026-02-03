import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/data/mockData";

interface EndFDModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fdName: string;
  currentValue: number;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export function EndFDModal({
  open,
  onOpenChange,
  fdName,
  currentValue,
  onConfirm,
  isProcessing = false,
}: EndFDModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[90%] rounded-2xl bg-card border-border sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">End Fixed Deposit</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground space-y-2">
            <p>
              Are you sure you want to close "{fdName}"?
            </p>
            <p className="font-medium text-foreground">
              Current Value: {formatCurrency(currentValue)}
            </p>
            <p>
              This amount will be moved to your Savings account. This action is irreversible.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-3">
          <AlertDialogCancel 
            className="flex-1 mt-0 border-border"
            disabled={isProcessing}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="flex-1 bg-primary hover:bg-primary/90"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "End FD & Move to Savings"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
