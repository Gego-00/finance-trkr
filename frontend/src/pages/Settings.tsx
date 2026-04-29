import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
/* import { Button } from '@/components/ui/button'; */
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Palette } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Profile</CardTitle>
              </div>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-muted-foreground">Full Name</Label>
                <p className="font-medium">{user?.fullName}</p>
              </div>
              <div className="grid gap-2">
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{user?.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                <CardTitle>Appearance</CardTitle>
              </div>
              <CardDescription>Customize how the app looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)}>
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose between light, dark, or system theme
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>Application information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <span className="text-muted-foreground">Version:</span> 1.0.0
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Built with:</span> React, TypeScript, Tailwind CSS, shadcn/ui
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
