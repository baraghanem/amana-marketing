// src/components/ui/navbar.tsx
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Target, 
  Users, 
  Calendar, 
  Globe, 
  Smartphone, // New Icon
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { useState } from 'react';

// --- This is a new helper component for the nav links ---
function NavLink({ href, icon: Icon, children }: { href: string, icon: React.ElementType, children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href}>
      <span
        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200
        ${isActive 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
        }`}
      >
        <Icon className="h-5 w-5" />
        <span className="font-medium text-sm">{children}</span>
      </span>
    </Link>
  );
}

// --- Main Navbar Component ---
export function Navbar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // NOTE: This is an assumed structure. If your real navbar is different,
  // just add the new NavLink for '/device-view' to your existing list.

  return (
    <nav 
      className={`flex h-screen flex-col justify-between border-r border-gray-700 bg-gray-800 p-4 transition-all duration-300
      ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      <div>
        {/* Header */}
        <div className={`flex items-center gap-3 px-3 py-2 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'hidden' : 'flex'}`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
              A
            </span>
            <span className="text-md font-semibold text-white">Amana Marketing</span>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
          >
            {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className={`mt-8 flex flex-col gap-2 ${isCollapsed ? 'items-center' : ''}`}>
          <NavLink href="/" icon={LayoutDashboard}>
            {isCollapsed ? '' : 'Overview'}
          </NavLink>
          <NavLink href="/campaign-view" icon={Target}>
            {isCollapsed ? '' : 'Campaign View'}
          </NavLink>
          <NavLink href="/demographic-view" icon={Users}>
            {isCollapsed ? '' : 'Demographic View'}
          </NavLink>
          <NavLink href="/weekly-view" icon={Calendar}>
            {isCollapsed ? '' : 'Weekly View'}
          </NavLink>
          <NavLink href="/region-view" icon={Globe}>
            {isCollapsed ? '' : 'Region View'}
          </NavLink>
          
          {/* --- THIS IS THE NEW LINK YOU REQUESTED --- */}
          <NavLink href="/device-view" icon={Smartphone}>
            {isCollapsed ? '' : 'Device View'}
          </NavLink>
          
        </div>
      </div>

      {/* Footer / User Profile */}
      <div className={`border-t border-gray-700 pt-4 ${isCollapsed ? 'hidden' : 'block'}`}>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-600 text-sm font-medium text-white">
            AM
          </span>
          <div>
            <p className="text-sm font-medium text-white">Marketing Team</p>
            <p className="text-xs text-gray-400">Campaign Manager</p>
          </div>
          <span className="ml-auto h-2 w-2 rounded-full bg-green-500"></span>
        </div>
      </div>
    </nav>
  );
}