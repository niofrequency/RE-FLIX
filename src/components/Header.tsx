import React, { useState, useEffect } from 'react';
import { Search, Bell, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  onSearch: (query: string) => void;
  activeTab: 'home' | 'movies' | 'tv' | 'list';
  setActiveTab: (tab: 'home' | 'movies' | 'tv' | 'list') => void;
}

export default function Header({ onSearch, activeTab, setActiveTab }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearch('');
    setIsSearchOpen(false);
  };

  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'movies', label: 'Movies' },
    { id: 'tv', label: 'TV Shows' },
    { id: 'list', label: 'My List' }
  ] as const;

  return (
    <header
      id="header-nav"
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 flex items-center justify-between px-4 md:px-12 py-4 ${
        isScrolled ? 'bg-[#141414] shadow-md border-b border-white/5' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="flex items-center space-x-4 md:space-x-10">
        {/* RE-FLIX Logo */}
        <div 
          id="reflix-logo"
          onClick={() => { setActiveTab('home'); handleClearSearch(); }}
          className="text-[#e50914] font-black text-2xl md:text-3xl tracking-tighter cursor-pointer font-sans select-none hover:scale-105 transition-transform"
        >
          RE-FLIX
        </div>

        {/* Navigation Items */}
        <nav className="hidden md:flex space-x-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => { setActiveTab(item.id); handleClearSearch(); }}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                activeTab === item.id ? 'text-white font-semibold' : 'text-gray-300 hover:text-gray-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="relative flex items-center" id="search-container">
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 240, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center bg-black/60 border border-white/30 rounded px-2.5 py-1.5"
              >
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Titles, people, genres..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="bg-transparent text-white text-xs outline-none w-full placeholder-gray-500"
                  autoFocus
                />
                {searchQuery && (
                  <button onClick={handleClearSearch} className="cursor-pointer">
                    <X className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!isSearchOpen && (
            <button
              id="search-button-trigger"
              onClick={() => setIsSearchOpen(true)}
              className="p-1 text-gray-200 hover:text-white transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Notifications Icon (Decorative) */}
        <button className="p-1 text-gray-200 hover:text-white transition-colors relative cursor-pointer hidden sm:block">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#e50914] rounded-full"></span>
        </button>

        {/* Profiles Dropdown / Avatar */}
        <div className="flex items-center space-x-1 cursor-pointer group relative py-1" id="avatar-container">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
            R
          </div>
          <div className="absolute right-0 top-full mt-2 w-48 bg-[#181818] border border-white/10 rounded shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-150 py-2 text-xs">
            <div className="px-4 py-2 border-b border-white/5 font-semibold text-gray-200">
              RE-FLIX Profile
            </div>
            <button 
              onClick={() => { setActiveTab('list'); }}
              className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              My Watchlist
            </button>
            <div className="px-4 py-2.5 text-gray-500">
              Viking Stream Active
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
