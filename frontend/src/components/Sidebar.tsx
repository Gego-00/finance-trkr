import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Receipt,
  Tags,
  Target,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Transactions',
    href: '/transactions',
    icon: Receipt,
  },
  {
    title: 'Categories',
    href: '/categories',
    icon: Tags,
  },
  {
    title: 'Savings Goals',
    href: '/savings-goals',
    icon: Target,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg">Finance Tracker</span>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn('w-full', collapsed ? 'justify-center' : 'justify-start')}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
