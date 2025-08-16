"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  BarChart3,
  Search,
  FileBarChart,
  Link as LinkIcon,
  Settings,
  Users,
  CreditCard,
  LogOut,
  Moon,
  Sun,
  Globe,
  Menu,
  X,
  LayoutDashboard,
  FolderOpen,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useSWR from 'swr';

// Data fetcher
const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isRTL = i18n.language === 'ar';

  // Fetch user's projects for rankings dropdown
  const { data: projects } = useSWR('/projects', fetcher);
  
  // Sort projects by name for dropdowns
  const sortedProjects = useMemo(() => {
    if (!projects) return [];
    return [...projects].sort((a, b) => a.name.localeCompare(b.name));
  }, [projects]);
  
  const navigationItems = [
    {
      href: '/dashboard',
      label: t('navigation.dashboard'),
      icon: LayoutDashboard,
    },
    {
      href: '/projects',
      label: t('navigation.projects'),
      icon: FolderOpen,
    },
    {
      href: '/projects/tags',
      label: 'Tags',
      icon: Tag,
    },
    {
      href: '/audits',
      label: t('navigation.audits'),
      icon: Search,
    },
    {
      href: '/backlinks',
      label: t('navigation.backlinks'),
      icon: LinkIcon,
    },
    {
      href: '/reports',
      label: t('navigation.reports'),
      icon: FileBarChart,
    },
  ];

  const adminItems = [
    {
      href: '/admin',
      label: t('navigation.admin'),
      icon: Users,
    },
  ];

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error("Logout failed", err);
    }
    logout();
    router.push('/auth/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <div className="flex items-center space-x-4 lg:space-x-0">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Search className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold">SEO Pro</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center">
          <NavigationMenu>
            <NavigationMenuList className="flex space-x-1 relative">
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <Link href={item.href} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                        pathname === item.href && "bg-accent text-accent-foreground"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {item.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
              
              {/* Rankings Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(
                  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                  pathname.startsWith('/rankings') && "bg-accent text-accent-foreground"
                )}>
                  <BarChart3 className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  {t('navigation.rankings')}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-48 p-2">
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {sortedProjects && sortedProjects.length > 0 ? (
                        sortedProjects.map((project: any) => (
                          <Link
                            key={project.id}
                            href={`/rankings/${project.id}`}
                            className="block p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                          >
                            {project.name}
                          </Link>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No projects found</p>
                          <Link
                            href="/projects"
                            className="text-xs text-primary hover:underline mt-1 inline-block"
                          >
                            Create your first project
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              {/* Tags Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(
                  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                  pathname.includes('/tags') && "bg-accent text-accent-foreground"
                )}>
                  <Tag className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  Tags
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-48 p-2">
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {sortedProjects && sortedProjects.length > 0 ? (
                        sortedProjects.map((project: any) => (
                          <Link
                            key={project.id}
                            href={`/projects/${project.id}/tags`}
                            className="block p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                          >
                            {project.name}
                          </Link>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <Tag className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No projects found</p>
                          <Link
                            href="/projects"
                            className="text-xs text-primary hover:underline mt-1 inline-block"
                          >
                            Create your first project
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              {user?.role === 'admin' && adminItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <Link href={item.href} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                        pathname === item.href && "bg-accent text-accent-foreground"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {item.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side controls */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Globe className="h-4 w-4" />
                <span className="sr-only">Switch language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLanguageChange('ar')}>
                العربية
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                {t('settings.lightMode')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                {t('settings.darkMode')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                {t('settings.systemTheme')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" alt={user?.name} />
                  <AvatarFallback>
                    {user?.name
                      ?.split(' ')
                      .map((n) => n[0]?.toUpperCase())
                      .join('')
                      .slice(0, 2)}
                    {/* {user?.name?.[0]?.toUpperCase()} */}
                    {/* {user?.firstName?.[0]}{user?.lastName?.[0]} */}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name}
                    {/* {user?.firstName} {user?.lastName} */}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  {t('navigation.settings')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/billing">
                  <CreditCard className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  {t('navigation.billing')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {t('navigation.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href && "bg-accent text-accent-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {item.label}
              </Link>
            ))}
            
            {/* Mobile Rankings Section */}
            <div className="px-3 py-2">
              <div className="text-sm font-medium text-muted-foreground mb-2">Rankings</div>
              {sortedProjects && sortedProjects.length > 0 ? (
                sortedProjects.map((project: any) => (
                  <Link
                    key={project.id}
                    href={`/rankings/${project.id}`}
                    className="block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <BarChart3 className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {project.name}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No projects available
                </div>
              )}
            </div>
            
            {/* Mobile Tags Section */}
            <div className="px-3 py-2">
              <div className="text-sm font-medium text-muted-foreground mb-2">Tags</div>
              {sortedProjects && sortedProjects.length > 0 ? (
                sortedProjects.map((project: any) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}/tags`}
                    className="block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Tag className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {project.name}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No projects available
                </div>
              )}
            </div>
            
            {user?.role === 'admin' && adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href && "bg-accent text-accent-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}