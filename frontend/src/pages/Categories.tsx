import { useState, useEffect } from 'react';
import { categoriesApi } from '@/lib/api';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import CategoryDialog from '@/components/CategoryDialog';
import type { Category } from '@/types';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await categoriesApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? Transactions using this category will have their category removed.')) {
      return;
    }

    try {
      await categoriesApi.delete(id);
      await loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCategory(undefined);
    loadCategories();
  };

  const incomeCategories = categories.filter((cat) => cat.type === 'income');
  const expenseCategories = categories.filter((cat) => cat.type === 'expense');

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-muted-foreground">
              Manage your income and expense categories
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Income Categories</CardTitle>
              <CardDescription>
                Categories for tracking your income sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Color</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomeCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No income categories yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    incomeCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: category.color || '#10b981' }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Expense Categories</CardTitle>
              <CardDescription>
                Categories for tracking your expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Color</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No expense categories yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenseCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: category.color || '#ef4444' }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <CategoryDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        category={editingCategory}
      />
    </Layout>
  );
}
