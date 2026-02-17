"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatCurrency(amount) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "Hace unos segundos";
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
  if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;
  return new Date(date).toLocaleDateString("es-AR");
}

export default function DashboardPage() {
  const [data, setData] = useState({
    clients: [],
    classes: [],
    reservations: [],
    payments: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [clientsRes, classesRes, reservationsRes, paymentsRes] = await Promise.all([
        fetch("/api/members"),
        fetch("/api/classes"),
        fetch("/api/reservations"),
        fetch("/api/payments"),
      ]);

      const [clientsData, classesData, reservationsData, paymentsData] = await Promise.all([
        clientsRes.json(),
        classesRes.json(),
        reservationsRes.json(),
        paymentsRes.json(),
      ]);

      setData({
        clients: Array.isArray(clientsData) ? clientsData : [],
        classes: Array.isArray(classesData) ? classesData : [],
        reservations: Array.isArray(reservationsData) ? reservationsData : [],
        payments: Array.isArray(paymentsData) ? paymentsData : [],
      });
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando dashboard...</div>
      </div>
    );
  }

  const activeClients = data.clients.filter((c) => c.status === "ACTIVE").length;
  const pendingReservations = data.reservations.filter((r) => r.status === "PENDING").length;

  const monthlyIncome = data.payments
    .filter((p) => {
      const paymentDate = new Date(p.date);
      const now = new Date();
      return (
        p.status === "COMPLETED" &&
        paymentDate.getMonth() === now.getMonth() &&
        paymentDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const recentClients = [...data.clients]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const recentPayments = [...data.payments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Bienvenido al panel de administración.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients}</div>
            <p className="text-xs text-muted-foreground">{data.clients.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.classes.length}</div>
            <p className="text-xs text-muted-foreground">Disponibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reservaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.reservations.length}</div>
            <p className={`text-xs ${pendingReservations > 0 ? "text-yellow-500" : "text-muted-foreground"}`}>
              {pendingReservations} pendientes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-green-600">{formatCurrency(monthlyIncome)}</div>
            <p className="text-xs text-muted-foreground">
              {data.payments.filter((p) => p.status === "COMPLETED").length} pagos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lists */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Clientes Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClients.length === 0 ? (
                <p className="text-muted-foreground text-sm">No hay clientes registrados</p>
              ) : (
                recentClients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                        {client.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{client.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {client.plan === "PREMIUM" ? "Premium" : "Básico"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{timeAgo(client.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.length === 0 ? (
                <p className="text-muted-foreground text-sm">No hay pagos registrados</p>
              ) : (
                recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{payment.member?.name || "Sin cliente"}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-150px">{payment.concept}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600 text-sm">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(payment.date)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}