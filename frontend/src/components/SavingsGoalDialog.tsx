import { useState, useEffect } from 'react';
import { savingsGoalsApi } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { SavingsGoal } from '@/types';

interface SavingsGoalDialogProps {
  open: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export default function SavingsGoalDialog({
  open,
  onClose,
  goal,
}: SavingsGoalDialogProps) {
  const [targetPercentage, setTargetPercentage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (goal) {
      setTargetPercentage(parseFloat(goal.target_percentage).toString());
    } else {
      setTargetPercentage('');
    }
    setError('');
  }, [goal, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const value = parseFloat(targetPercentage);
    if (isNaN(value) || value < 0 || value > 100) {
      setError('Please enter a valid percentage between 0 and 100');
      return;
    }

    setIsLoading(true);

    try {
      await savingsGoalsApi.upsertGoal(value);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save savings goal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{goal ? 'Update Savings Target' : 'Set Savings Target'}</DialogTitle>
          <DialogDescription>
            Set the percentage of your monthly income you want to save.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="targetPercentage">Target Savings Rate (%)</Label>
              <Input
                id="targetPercentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="e.g. 20"
                value={targetPercentage}
                onChange={(e) => setTargetPercentage(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                This is the percentage of your monthly income you aim to save.
              </p>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : goal ? 'Update' : 'Set Target'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
