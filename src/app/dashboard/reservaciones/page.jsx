"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function ReservacionesPage() {
  const [reservations, setReservations] = useState([]);
  const [clients, setClients] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("Todas");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resRes, clientsRes, classesRes] = await Promise.all([
        fetch("/api/reservations"),
        fetch("/api/members"),
        fetch("/api/classes")
      ]);
      const [resData, clientsData, classesData] = await Promise.all([
        resRes.json(),
        clientsRes.json(),
        classesRes.json(),
      ]);
      setReservations(Array.isArray(resData) ? resData : []);
      setClients(Array.isArray(clientsData) ? clientsData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReservations = filterStatus === "Todas"
    ? reservations
    : reservations.filter((r) => r.status === filterStatus);

  const handleDelete = async (id) => {
    if (confirm("¿Eliminar esta reservación?")) {
      try {
        await fetch(`/api/reservations/${id}`, { method: "DELETE" });
        setReservations(reservations.filter((r) => r.id !== id));
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const updated = await res.json();
      setReservations(reservations.map((r) => (r.id === id ? updated : r)));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSave = async (data) => {
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const newRes = await res.json();
      setReservations([newRes, ...reservations]);
      setShowModal(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const stats = {
    total: reservations.length,
    confirmadas: reservations.filter((r) => r.status === "CONFIRMED").length,
    pendientes: reservations.filter((r) => r.status === "PENDING").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando reservaciones...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Reservaciones</h1>
          <p className="text-muted-foreground">Gestiona las reservaciones de clases</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="w-full sm:w-auto cursor-pointer">
          + Nueva Reservación
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.confirmadas}</div>
            <p className="text-sm text-muted-foreground">Confirmadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">{stats.pendientes}</div>
            <p className="text-sm text-muted-foreground">Pendientes</p>
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
            <option value="Todas">Todas</option>
            <option value="CONFIRMED">Confirmadas</option>
            <option value="PENDING">Pendientes</option>
            <option value="CANCELLED">Canceladas</option>
          </select>
        </CardContent>
      </Card>

      {/* Vista Mobile: Cards */}
      <div className="md:hidden space-y-3">
        {filteredReservations.map((r) => (
          <Card key={r.id}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{r.member?.name || "Sin cliente"}</p>
                  <p className="text-sm text-muted-foreground">{r.class?.name || "Sin clase"}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  r.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
                  r.status === "CANCELLED" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                }`}>
                  {r.status === "CONFIRMED" ? "Confirmada" : r.status === "CANCELLED" ? "Cancelada" : "Pendiente"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {r.date ? new Date(r.date).toLocaleDateString("es-AR") : "-"}
                </span>
                <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:underline cursor-pointer">Eliminar</button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredReservations.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No hay reservaciones</p>
        )}
      </div>

      {/* Vista Desktop: Tabla */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Lista de Reservaciones ({filteredReservations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Cliente</th>
                  <th className="pb-3 font-medium text-muted-foreground">Clase</th>
                  <th className="pb-3 font-medium text-muted-foreground">Fecha</th>
                  <th className="pb-3 font-medium text-muted-foreground">Estado</th>
                  <th className="pb-3 font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="py-4 font-medium">{r.member?.name || "Sin cliente"}</td>
                    <td className="py-4">{r.class?.name || "Sin clase"}</td>
                    <td className="py-4 text-muted-foreground">
                      {r.date ? new Date(r.date).toLocaleDateString("es-AR") : "-"}
                    </td>
                    <td className="py-4">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                        className={`rounded px-2 py-1 text-xs font-medium border-0 cursor-pointer ${
                          r.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
                          r.status === "CANCELLED" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        <option value="CONFIRMED">Confirmada</option>
                        <option value="PENDING">Pendiente</option>
                        <option value="CANCELLED">Cancelada</option>
                      </select>
                    </td>
                    <td className="py-4">
                      <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-400 cursor-pointer hover:underline"><Trash2 className="w-4 h-4 inline-block mr-1" />Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredReservations.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No hay reservaciones</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <ReservationModal
          clients={clients}
          classes={classes}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function ReservationModal({ clients, classes, onClose, onSave }) {
  const [formData, setFormData] = useState({
    memberId: "",
    classId: "",
    date: "",
    status: "PENDING",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      date: new Date(formData.date),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Nueva Reservación</h2>
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
            <label className="block text-sm font-medium mb-1">Clase</label>
            <select
              required
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-2 cursor-pointer"
            >
              <option value="">Seleccionar clase</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name} - {c.day} {c.time}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <input
              type="datetime-local"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-2"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 cursor-pointer hover:bg-secondary/80">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 cursor-pointer hover:bg-primary/80">
              Crear
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}