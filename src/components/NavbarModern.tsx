"use client"

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Plane, User, LogOut, Wallet, LayoutDashboard } from "lucide-react"
import { useAuth } from '../contexts/AuthContext';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export default function NavbarModern() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, userProfile } = useAuth();
  
  // Check if the user is an admin
  const isAdmin = userProfile?.role === 'admin' || 
                  userProfile?.isAdmin === true || 
                  userProfile?.email === 'admin@example.com' ||
                  userProfile?.email === 'adityasenpai396@gmail.com';
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    // Close menu when route changes
    setIsMenuOpen(false);
  }, [location]);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  const navLinks = [
    { path: '/', name: 'Home' },
    { path: '/flights', name: 'Flights' },
  ];
  
  // Add bookings link only for authenticated users
  if (currentUser) {
    navLinks.push({ path: '/bookings', name: 'My Bookings' });
  }
  
  // Handle wallet display to support both wallet and walletBalance fields
  const getWalletBalance = () => {
    if (!userProfile) return '0';
    return userProfile.walletBalance !== undefined 
      ? userProfile.walletBalance.toLocaleString() 
      : (userProfile.wallet?.toLocaleString() || '0');
  };
  
  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    scrolled
      ? 'bg-background/90 backdrop-blur-md shadow-sm border-b border-border'
      : 'bg-transparent'
  }`;

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
              <Plane className="text-primary-foreground h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 text-transparent bg-clip-text">
              AeroVoyage
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary group ${
                  location.pathname === link.path
                    ? 'text-primary'
                    : 'text-foreground'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
            ))}
          </div>
          
          {/* Authenticated User Options */}
          {currentUser && userProfile ? (
            <div className="hidden md:flex items-center space-x-4">
              {/* Wallet */}
              <div className="px-3 py-1 bg-secondary rounded-full flex items-center text-secondary-foreground">
                <Wallet className="h-4 w-4 mr-2" />
                <span className="font-medium">₹{getWalletBalance()}</span>
              </div>
              
              {/* Mode Toggle */}
              <ModeToggle />
              
              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 p-0">
                    {userProfile.photoURL ? (
                      <img src={userProfile.photoURL} alt="Profile" className="h-9 w-9 rounded-full" />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-5 w-5 text-secondary-foreground" />
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Your Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link to="/bookings" className="flex items-center">
                      <Plane className="mr-2 h-4 w-4" />
                      <span>My Bookings</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            /* Login, Signup buttons and theme toggle for non-authenticated users */
            <div className="hidden md:flex items-center space-x-4">
              <ModeToggle />
              
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ModeToggle />
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-full"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="space-y-1">
              {/* Navigation links */}
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === link.path
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-secondary hover:text-accent-foreground'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Auth buttons for mobile */}
              {currentUser ? (
                <>
                  <div className="border-t border-border my-2 pt-2">
                    <Link
                      to="/profile"
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-secondary hover:text-secondary-foreground"
                    >
                      <User className="mr-3 h-5 w-5" />
                      Your Profile
                    </Link>
                    
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-secondary hover:text-secondary-foreground"
                      >
                        <LayoutDashboard className="mr-3 h-5 w-5" />
                        Admin Dashboard
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-secondary hover:text-secondary-foreground"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-border my-2 pt-2 flex flex-col space-y-2">
                  <Link
                    to="/login"
                    className="px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-secondary hover:text-secondary-foreground"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-base font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 