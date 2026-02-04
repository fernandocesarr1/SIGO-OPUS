import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Package, 
  Megaphone, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Menu,
  Shield
} from 'lucide-react';

export const Layout: React.FC = () => {
  const location = useLocation();

  const getPageTitle = (path: string) => {
    switch(path) {
      case '/': return 'Dashboard Principal';
      case '/p1': return 'P/1 - Administração de Pessoal';
      case '/p3': return 'P/3 - Planejamento Operacional';
      case '/p4': return 'P/4 - Materiais e Logística';
      case '/p5': return 'P/5 - Comunicação Social';
      default: return 'SIGO';
    }
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/p1', label: 'P/1 Pessoal', icon: Users },
    { path: '/p3', label: 'P/3 Operacional', icon: BarChart3 },
    { path: '/p4', label: 'P/4 Logística', icon: Package },
    { path: '/p5', label: 'P/5 Comunicação', icon: Megaphone },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-900 text-white flex-shrink-0 hidden md:flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center px-6 border-b border-primary-800 bg-primary-950">
          <Shield className="w-8 h-8 text-primary-400 mr-3" />
          <div>
            <h1 className="font-bold text-lg tracking-wide">SIGO</h1>
            <p className="text-xs text-primary-400">3º BPAmb - 4ª Cia</p>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 group ${
                  isActive 
                    ? 'bg-primary-700 text-white shadow-md' 
                    : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-primary-800">
          <button className="flex items-center text-primary-200 hover:text-white w-full px-4 py-2 hover:bg-primary-800 rounded-md transition-colors">
            <Settings className="w-5 h-5 mr-3" />
            <span className="text-sm">Configurações</span>
          </button>
          <button className="flex items-center text-red-300 hover:text-red-100 w-full px-4 py-2 mt-1 hover:bg-primary-800 rounded-md transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
          <div className="flex items-center">
            <button className="md:hidden mr-4 text-gray-500 hover:text-gray-700">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-gray-800">{getPageTitle(location.pathname)}</h2>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Busca global..." 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>

            <button className="relative text-gray-500 hover:text-primary-600 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">Cap PM Silva</p>
                <p className="text-xs text-gray-500">Comandante</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border-2 border-primary-200">
                CS
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};