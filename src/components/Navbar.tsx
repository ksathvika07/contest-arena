import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AvatarBadge } from './AvatarPicker';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import type { Notification } from '../types';
import {
  Trophy,
  Activity,
  Layers,
  BarChart3,
  UserCheck,
  ShieldAlert,
  Database,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Radio,
  CheckCircle2,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();

  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Socket connection state listener
  useEffect(() => {
    const socket = getSocket();
    setIsSocketConnected(socket.connected);

    const onConnect = () => setIsSocketConnected(true);
    const onDisconnect = () => setIsSocketConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  // Fetch notifications if logged in
  useEffect(() => {
    if (isAuthenticated) {
      api.getNotifications()
        .then((res) => {
          if (res.success) {
            setNotifications(res.notifications);
            setUnreadCount(res.unreadCount);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {}
  };

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: Layers },
    {
      label: 'Leaderboard',
      path: '/leaderboard',
      icon: Trophy,
      badge: 'LIVE',
    },
    { label: 'Contests', path: '/contests', icon: Activity },
    { label: 'Problems', path: '/contests/problems', icon: Layers },
    ...(isAuthenticated
      ? [{ label: 'My Performance', path: '/performance', icon: UserCheck }]
      : []),
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    ...(isAdmin ? [{ label: 'Admin Panel', path: '/admin', icon: ShieldAlert }] : []),
    { label: 'Database Demo', path: '/database-demo', icon: Database, badge: 'NoSQL' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-arena-midnight/90 backdrop-blur-md border-b border-arena-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Wordmark */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arena-peach to-arena-berry flex items-center justify-center shadow-glow-peach transition-transform group-hover:scale-105">
              <Trophy className="w-5 h-5 text-arena-midnight fill-arena-midnight" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white font-sans">
                  CONTEST<span className="text-arena-peach">ARENA</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-arena-berry/60 text-arena-blush border border-arena-rose/30">
                  VIT-AP
                </span>
              </div>
              <p className="text-[10px] font-semibold tracking-wider uppercase text-arena-peach/90">
                Compete. Climb. Conquer.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-arena-aubergine text-arena-peach border border-arena-peach/30 shadow-sm'
                      : 'text-arena-blush hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-arena-peach' : 'text-arena-rose'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-1 px-1.5 py-0.2 text-[9px] font-extrabold rounded-full bg-arena-peach text-arena-midnight uppercase">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Area: Socket Status + Notifications + User Profile / Auth */}
          <div className="flex items-center space-x-3">
            {/* Live Socket Connection Pulse Indicator */}
            <div
              className="hidden sm:flex items-center space-x-1.5 bg-arena-aubergine/60 px-2.5 py-1 rounded-full border border-arena-border text-[11px]"
              title={isSocketConnected ? 'Connected to Redis Pub/Sub & Socket.IO' : 'Connecting to Live Server...'}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isSocketConnected ? 'bg-emerald-400 animate-live-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-gray-300 font-medium">
                {isSocketConnected ? 'Live Updates' : 'Connecting'}
              </span>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowUserMenu(false);
                    }}
                    className="relative p-2 rounded-xl bg-arena-aubergine/80 hover:bg-arena-aubergine text-arena-blush hover:text-white border border-arena-border transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-arena-peach text-arena-midnight rounded-full text-[10px] font-extrabold flex items-center justify-center shadow">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-arena-card rounded-2xl shadow-card-elevated border border-arena-peach/20 overflow-hidden z-50">
                      <div className="p-3 bg-arena-aubergine/80 border-b border-arena-border flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] text-arena-peach hover:underline font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-arena-border">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-gray-400">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              className={`p-3 text-xs transition-colors hover:bg-white/5 ${
                                !notif.isRead ? 'bg-arena-aubergine/40' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold text-arena-peach mb-1">
                                <span>{notif.title}</span>
                                <span className="text-[10px] text-gray-400 font-normal">
                                  {new Date(notif.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-gray-300 text-[11px]">{notif.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar & Menu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowNotifications(false);
                    }}
                    className="flex items-center space-x-2 p-1.5 rounded-xl bg-arena-aubergine hover:bg-arena-berry/40 border border-arena-border transition-all"
                  >
                    <AvatarBadge avatarId={user?.avatarId || 'avatar_cyber_ninja'} size="sm" />
                    <span className="text-xs font-bold text-white max-w-[100px] truncate hidden sm:inline">
                      {user?.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-arena-card rounded-2xl shadow-card-elevated border border-arena-peach/20 overflow-hidden z-50">
                      <div className="p-4 bg-arena-aubergine/80 border-b border-arena-border flex items-center space-x-3">
                        <AvatarBadge avatarId={user?.avatarId || 'avatar_cyber_ninja'} size="md" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                          <p className="text-[10px] text-arena-peach font-mono">{user?.studentId}</p>
                          <p className="text-[10px] text-gray-400 truncate">{user?.department}</p>
                        </div>
                      </div>

                      <div className="p-2 space-y-1">
                        <Link
                          to="/performance"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-gray-200 hover:text-arena-peach hover:bg-white/5 rounded-lg"
                        >
                          <UserCheck className="w-4 h-4 text-arena-peach" />
                          <span>My Performance & Rank</span>
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-gray-200 hover:text-arena-peach hover:bg-white/5 rounded-lg"
                          >
                            <ShieldAlert className="w-4 h-4 text-arena-peach" />
                            <span>Administrator Console</span>
                          </Link>
                        )}
                        <Link
                          to="/database-demo"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-gray-200 hover:text-arena-peach hover:bg-white/5 rounded-lg"
                        >
                          <Database className="w-4 h-4 text-arena-peach" />
                          <span>Live Database Explorer</span>
                        </Link>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-arena-blush hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs font-extrabold rounded-xl bg-gradient-to-r from-arena-peach to-arena-rose text-arena-midnight hover:shadow-glow-peach transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-arena-aubergine text-gray-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation tray */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-arena-card border-b border-arena-border px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                  isActive
                    ? 'bg-arena-aubergine text-arena-peach'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4 text-arena-peach" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-arena-peach text-arena-midnight">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
