import React from 'react'

import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FileText, User, LogOut, BrainCircuit, BookOpen, X } from 'lucide-react';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogOut = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { to: '/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
    { to: '/documents', icon: FileText, text: 'Documents' },
    { to: '/flashcards', icon: BookOpen, text: 'Flashcards' },
    { to: '/profile', icon: User, text: 'Profile' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 md:hidden transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      ></div>

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white/90 backdrop-blur-lg border-r border-[#DCE6E8] z-50 md:relative md:w-64 md:shrink-0 md:flex md:flex-col md:translate-x-0 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo and Close button for mobile */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-[#DCE6E8]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-br from-[#4F9DA6] to-[#3D7F87] shadow-md shadow-[#4F9DA6]/20">
              <BrainCircuit className="text-white" size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-sm md:text-base font-bold text-[#2A3439] tracking-tight">Learnify AI</h1>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-[#647278] hover:text-[#2A3439]">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col px-3 py-6 space-y-1.5">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={toggleSidebar}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-linear-to-r from-[#4F9DA6] to-[#3D7F87] text-white shadow-[#4F9DA6]/25'
                    : 'text-[#2A3439] hover:bg-[#F7FAFB] hover:text-[#2A3439]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon
                    size={18}
                    strokeWidth={2.5}
                    className={`transition-transform duration-200 ${
                      isActive ? '' : 'group-hover:scale-110'
                    }`}
                  />
                  {link.text}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="px-3 py-4 border-t border-[#DCE6E8]">
          <button
            onClick={handleLogOut}
            className="group flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-[#2A3439] hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
          >
            <LogOut
              size={18}
              strokeWidth={2.5}
              className="transition-transform duration-200 group-hover:scale-110"
            />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
