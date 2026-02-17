"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Calendar, Clipboard, CreditCard, Home, 
  Users, LogOut, TrendingUp, Menu, X, Dumbbell 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Clientes", href: "/dashboard/members", icon: Users },
  { name: "Clases", href: "/dashboard/clases", icon: Calendar },
  { name: "Membresías", href: "/dashboard/membresias", icon: Dumbbell },
  { name: "Reservaciones", href: "/dashboard/reservaciones", icon: Clipboard },
  { name: "Pagos", href: "/dashboard/pagos", icon: CreditCard },
  { name: "Ingresos", href: "/dashboard/ingresos", icon: TrendingUp },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Header móvil */}
      <div className="fixed top-0 left-0 right-0 z-50 lg:hidden bg-card border-b border-border h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-white">G</span>
          </div>
          <span className="text-xl font-bold text-foreground">GymApp</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-secondary text-foreground"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Overlay móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-white">G</span>
          </div>
          <span className="text-xl font-bold text-foreground">GymApp</span>
        </div>
        
        <nav className="space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                  isActive 
                    ? "bg-primary text-white" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        {/* Cerrar sesión */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <Link
            href="/logout"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </Link>
        </div>
      </aside>
    </>
  );
}