'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  Upload,
  Settings,
  Menu,
  Search,
  Bell,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useCartStore } from '@/stores/cart-store';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { getInitials } from '@/lib/utils';

export function Header() {
  const { data:  session, status } = useSession();
  const { items, openCart } = useCartStore();
  const isLoading = status === 'loading';
  const isAuthenticated = !!session?. user;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]: bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href={isAuthenticated ? "/search" : "/"} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl font-bold text-gradient">AssetBox</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/search"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Browse
            </Link>
            <Link
              href="/category/photos"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Photos
            </Link>
            <Link
              href="/category/videos"
              className="text-sm font-medium text-muted-foreground transition-colors hover: text-foreground"
            >
              Videos
            </Link>
            <Link
              href="/category/audio"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Audio
            </Link>
            <Link
              href="/category/templates"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Templates
            </Link>
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <Button variant="ghost" size="icon" asChild className="hidden md:flex">
            <Link href="/search">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>

          {isLoading ?  (
            // Loading skeleton
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
            </div>
          ) : isAuthenticated ? (
            // Authenticated user
            <>
              {/* Notifications */}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/notifications">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                </Link>
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={openCart}
              >
                <ShoppingCart className="h-5 w-5" />
                {items.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {items.length}
                  </Badge>
                )}
                <span className="sr-only">Cart</span>
              </Button>

              {/* Upload Button */}
              <Button asChild size="sm" className="hidden md:flex">
                <Link href="/dashboard/uploads/new">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Link>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={session. user. image || undefined}
                        alt={session.user. name || 'User'}
                      />
                      <AvatarFallback>
                        {getInitials(session.user.name || session.user.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/uploads">
                      <Upload className="mr-2 h-4 w-4" />
                      My Uploads
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/purchases">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      My Purchases
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {session.user.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <User className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            // Not authenticated
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/login">Get Started</Link>
              </Button>
            </>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <nav className="flex flex-col gap-4 pt-8">
                <Link
                  href="/search"
                  className="flex items-center gap-2 text-lg font-medium"
                >
                  <Search className="h-5 w-5" />
                  Search
                </Link>
                <Link
                  href="/category/photos"
                  className="text-lg font-medium text-muted-foreground"
                >
                  Photos
                </Link>
                <Link
                  href="/category/videos"
                  className="text-lg font-medium text-muted-foreground"
                >
                  Videos
                </Link>
                <Link
                  href="/category/audio"
                  className="text-lg font-medium text-muted-foreground"
                >
                  Audio
                </Link>
                <Link
                  href="/category/templates"
                  className="text-lg font-medium text-muted-foreground"
                >
                  Templates
                </Link>
                {isAuthenticated && (
                  <>
                    <hr className="my-2" />
                    <Link
                      href="/dashboard/uploads/new"
                      className="flex items-center gap-2 text-lg font-medium"
                    >
                      <Upload className="h-5 w-5" />
                      Upload Asset
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer />
    </header>
  );
}