import { useState, useEffect } from 'react';
import { categoriesApi } from '@/lib/api';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type { Category } from '@/types';

interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  category?: Category;
}

const COLOR_PRESETS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f97316', // orange
  '#64748b', // slate
];

export default function CategoryDialog({
  open,
  onClose,
  category,
}: CategoryDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [color, setColor] = useState('#3b82f6');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setType(category.type);
      setColor(category.color || '#3b82f6');
    } else {
      resetForm();
    }
  }, [category, open]);

  const resetForm = () => {
    setName('');
    setType('expense');
    setColor('#3b82f6');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = { name, type, color };

      if (category) {
        await categoriesApi.update(category.id, data);
      } else {
        await categoriesApi.create(data);
      }

      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save category');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Add Category'}</DialogTitle>
          <DialogDescription>
            {category
              ? 'Update the category details below'
              : 'Create a new category for your transactions'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Category name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={type}
                onValueChange={(value: 'income' | 'expense') => setType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      color === presetColor
                        ? 'border-foreground scale-110'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: presetColor }}
                    onClick={() => setColor(presetColor)}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Label htmlFor="customColor" className="text-sm text-muted-foreground">
                  Custom:
                </Label>
                <Input
                  id="customColor"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-8 p-0 border-0 cursor-pointer"
                />
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-24"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  placeholder="#000000"
                />
              </div>
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
              {isLoading ? 'Saving...' : category ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
