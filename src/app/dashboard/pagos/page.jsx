"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatCurrency(amount) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PagosPage() {
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("Todos");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, clientsRes] = await Promise.all([
        fetch("/api/payments"),
        fetch("/api/members")
      ]);
      const [paymentsData, clientsData] = await Promise.all([
        paymentsRes.json(),
        clientsRes.json(),
      ]);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setClients(Array.isArray(clientsData) ? clientsData : []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = filterStatus === "Todos"
    ? payments
    : payments.filter((p) => p.status === filterStatus);

  const totalIncome = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  const handleSave = async (data) => {
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const newPayment = await res.json();
      setPayments([newPayment, ...payments]);
      setShowModal(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando pagos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pagos</h1>
          <p className="text-muted-foreground">Gestiona los pagos y facturación</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="w-full sm:w-auto cursor-pointer hover:bg-primary/80">
          + Registrar Pago
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            <p className="text-sm text-muted-foreground">Ingresos Totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-sm text-muted-foreground">Total Pagos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtro */}
      <Card>
        <CardContent className="pt-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-input bg-background px-4 py-2 cursor-pointer"
          >
            <option value="Todos">Todos</option>
            <option value="COMPLETED">Completados</option>
            <option value="PENDING">Pendientes</option>
          </select>
        </CardContent>
      </Card>

      {/* Vista Mobile: Cards */}
      <div className="md:hidden space-y-3">
        {filteredPayments.map((payment) => (
          <Card key={payment.id}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{payment.member?.name || "Sin cliente"}</p>
                  <p className="text-sm text-muted-foreground">{payment.concept}</p>
                </div>
                <span className="text-green-600 font-bold">{formatCurrency(payment.amount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className={`px-2 py-1 rounded text-xs ${payment.status === "COMPLETED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                  {payment.status === "COMPLETED" ? "Completado" : "Pendiente"}
                </span>
                <span className="text-muted-foreground">{new Date(payment.date).toLocaleDateString("es-AR")}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredPayments.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No hay pagos registrados</p>
        )}
      </div>

      {/* Vista Desktop: Tabla */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Cliente</th>
                  <th className="pb-3 font-medium text-muted-foreground">Concepto</th>
                  <th className="pb-3 font-medium text-muted-foreground">Monto</th>
                  <th className="pb-3 font-medium text-muted-foreground">Método</th>
                  <th className="pb-3 font-medium text-muted-foreground">Estado</th>
                  <th className="pb-3 font-medium text-muted-foreground">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b">
                    <td className="py-4 font-medium">{payment.member?.name || "Sin cliente"}</td>
                    <td className="py-4 text-muted-foreground">{payment.concept}</td>
                    <td className="py-4 font-medium">{formatCurrency(payment.amount)}</td>
                    <td className="py-4">
                      {payment.method === "CASH" ? "Efectivo" : payment.method === "CARD" ? "Tarjeta" : "Transferencia"}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs ${payment.status === "COMPLETED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {payment.status === "COMPLETED" ? "Completado" : "Pendiente"}
                      </span>
                    </td>
                    <td className="py-4 text-muted-foreground">{new Date(payment.date).toLocaleDateString("es-AR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPayments.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No hay pagos registrados</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <PaymentModal
          clients={clients}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function PaymentModal({ clients, onClose, onSave }) {
  const [formData, setFormData] = useState({
    memberId: "",
    concept: "",
    amount: "",
    method: "CASH",
    status: "COMPLETED",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Registrar Pago</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <select
              required
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-2 cursor-pointer"
            >
              <option value="">Seleccionar cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Concepto</label>
            <input
              type="text"
              required
              value={formData.concept}
              onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Monto</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Método de Pago</label>
            <select
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-2 cursor-pointer"
            >
              <option value="CASH">Efectivo</option>
              <option value="CARD">Tarjeta</option>
              <option value="TRANSFER">Transferencia</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 cursor-pointer hover:bg-secondary/80">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 cursor-pointer hover:bg-primary/80">
              Registrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}