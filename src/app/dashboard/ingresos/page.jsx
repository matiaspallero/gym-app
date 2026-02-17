"use client";

import { useState, useEffect } from "react";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, Download 
} from "lucide-react";

export default function IngresosPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Datos calculados
  const [metrics, setMetrics] = useState({
    monthlyTotal: 0,
    yearlyTotal: 0,
    previousMonthTotal: 0,
    growth: 0
  });

  useEffect(() => {
    fetchIngresos();
  }, [selectedMonth, selectedYear]);

  const fetchIngresos = async () => {
    setLoading(true);
    try {
      // Simulamos la llamada a la API. Deberías reemplazar esto con tu fetch real.
      // const res = await fetch(`/api/payments?month=${selectedMonth}&year=${selectedYear}`);
      // const data = await res.json();
      
      // MOCK DATA PARA VISUALIZACIÓN (Borrar al integrar API)
      const mockData = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        member: `Cliente ${i + 1}`,
        amount: Math.floor(Math.random() * 15000) + 5000,
        date: new Date(selectedYear, selectedMonth, Math.floor(Math.random() * 28) + 1).toISOString(),
        method: Math.random() > 0.5 ? "Efectivo" : "Transferencia",
        plan: "Plan Mensual"
      })).sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(mockData);
      
      // Cálculo de métricas (esto idealmente viene del backend)
      const currentMonthSum = mockData.reduce((acc, curr) => acc + curr.amount, 0);
      const prevMonthSum = currentMonthSum * 0.9; // Simulado
      
      setMetrics({
        monthlyTotal: currentMonthSum,
        yearlyTotal: currentMonthSum * 12, // Proyección simple
        previousMonthTotal: prevMonthSum,
        growth: ((currentMonthSum - prevMonthSum) / prevMonthSum) * 100
      });

    } catch (error) {
      console.error("Error fetching ingresos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric" // Opcional si es el año actual
    });
  };

  return (
    <div className="space-y-6">
      {/* Header y Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ingresos</h1>
          <p className="text-muted-foreground">Reporte financiero y control de pagos.</p>
        </div>
        <div className="flex gap-2">
          <select 
            className="h-10 rounded-md cursor-pointer border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i}>
                {new Date(0, i).toLocaleString("es-AR", { month: "long" })}
              </option>
            ))}
          </select>
          <Button variant="outline" className="gap-2 cursor-pointer">
            <Download className="w-4 h-4" /> Exportar
          </Button>
        </div>
      </div>

      {/* Tarjetas de Métricas (KPIs) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Mes Actual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.monthlyTotal)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              {metrics.growth >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              <span className={metrics.growth >= 0 ? "text-green-500" : "text-red-500"}>
                {Math.abs(metrics.growth).toFixed(1)}%
              </span>
              <span className="ml-1">vs mes anterior</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyección Anual</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.yearlyTotal)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Basado en el promedio actual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(transactions.length ? metrics.monthlyTotal / transactions.length : 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Promedio por transacción
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sección Principal: Gráfico simple y Tabla */}
      <div className="grid gap-4 md:grid-cols-7">
        
        {/* Gráfico Simple (CSS puro) - Ocupa 3 columnas en desktop */}
        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle>Resumen Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-300px flex items-end justify-between gap-2 px-2">
              {[40, 70, 45, 90, 60, 80, 55].map((h, i) => (
                <div key={i} className="w-full group relative flex flex-col items-center gap-2">
                   {/* Tooltip simple */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black text-white text-xs px-2 py-1 rounded transition-opacity">
                    {h}%
                  </div>
                  {/* Barra */}
                  <div 
                    className="w-full bg-primary/20 hover:bg-primary transition-all duration-500 rounded-t-md" 
                    style={{ height: `${h}%` }}
                  ></div>
                  {/* Etiqueta Eje X */}
                  <span className="text-xs text-muted-foreground">
                    {["L", "M", "M", "J", "V", "S", "D"][i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Transacciones Recientes - Ocupa 4 columnas en desktop */}
        <Card className="col-span-1 md:col-span-4">
          <CardHeader>
            <CardTitle>Últimos Movimientos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm text-left">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Cliente</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground hidden sm:table-cell">Plan</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground hidden sm:table-cell">Método</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="h-24 text-center text-muted-foreground">Cargando...</td>
                    </tr>
                  ) : transactions.map((t) => (
                    <tr key={t.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <div className="font-medium">{t.member}</div>
                        <div className="text-xs text-muted-foreground sm:hidden">{formatDate(t.date)}</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">{formatDate(t.date)}</div>
                      </td>
                      <td className="p-4 align-middle hidden sm:table-cell">{t.plan}</td>
                      <td className="p-4 align-middle hidden sm:table-cell">
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                          {t.method}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-right font-bold">
                        {formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}