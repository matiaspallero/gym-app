"use client";

import { useState, useEffect } from "react";
// Mantengo tus imports originales
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingClient, setEditingClient] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/members");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando clientes:", error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de eliminar este cliente?")) {
      try {
        await fetch(`/api/members/${id}`, { method: "DELETE" });
        setClients(clients.filter((c) => c.id !== id));
      } catch (error) {
        console.error("Error eliminando cliente:", error);
      }
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingClient(null);
    setShowModal(true);
  };

  const handleSave = async (data) => {
    try {
      if (editingClient) {
        const res = await fetch(`/api/members/${editingClient.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const updated = await res.json();
        setClients(clients.map((c) => (c.id === editingClient.id ? updated : c)));
      } else {
        const res = await fetch("/api/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const newClient = await res.json();
        setClients([newClient, ...clients]);
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error guardando cliente:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando clientes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gestiona los clientes de tu gimnasio</p>
        </div>
        <Button className="cursor-pointer w-full sm:w-auto" onClick={handleAddNew}>+ Nuevo Cliente</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select className="rounded-lg cursor-pointer border border-border bg-background px-4 py-2">
              <option value="">Todos los planes</option>
              <option value="PREMIUM">Premium</option>
              <option value="BASIC">Básico</option>
            </select>
            <select className="rounded-lg cursor-pointer border border-border bg-background px-4 py-2">
              <option value="">Todos los estados</option>
              <option value="ACTIVE">Activo</option>
              <option value="EXPIRED">Vencido</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes ({filteredClients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {/* AQUÍ ESTÁ EL CAMBIO IMPORTANTE: overflow-x-auto */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-800px">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Nombre</th>
                  <th className="pb-3 font-medium text-muted-foreground">Email</th>
                  <th className="pb-3 font-medium text-muted-foreground">Teléfono</th>
                  <th className="pb-3 font-medium text-muted-foreground">Plan</th>
                  <th className="pb-3 font-medium text-muted-foreground">Estado</th>
                  <th className="pb-3 font-medium text-muted-foreground">Vencimiento</th>
                  <th className="pb-3 font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b border-border">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                          {client.name?.charAt(0)}
                        </div>
                        <span className="font-medium">{client.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-muted-foreground">{client.email}</td>
                    <td className="py-4 text-muted-foreground">{client.phone || "-"}</td>
                    <td className="py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        client.plan === "PREMIUM" 
                          ? "bg-primary/10 text-primary" 
                          : "bg-secondary text-secondary-foreground"
                      }`}>
                        {client.plan === "PREMIUM" ? "Premium" : "Básico"}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        client.status === "ACTIVE" 
                          ? "bg-accent/10 text-accent" 
                          : "bg-destructive/10 text-destructive"
                      }`}>
                        {client.status === "ACTIVE" ? "Activo" : client.status === "EXPIRED" ? "Vencido" : "Cancelado"}
                      </span>
                    </td>
                    <td className="py-4 text-muted-foreground">
                      {client.endDate ? new Date(client.endDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(client)}
                          className="rounded cursor-pointer p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <EditIcon />
                        </button>
                        <button 
                          onClick={() => handleDelete(client.id)}
                          className="rounded cursor-pointer p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredClients.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay clientes registrados
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <ClientModal
          client={editingClient}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// ... El resto de tu código (ClientModal, EditIcon, TrashIcon) se queda EXACTAMENTE IGUAL ...
// (Para ahorrar espacio no pego el modal de nuevo, pero úsalo tal cual lo tenías, funciona bien).

function ClientModal({ client, onClose, onSave }) {
  // Tu mismo código del Modal aquí...
  const [formData, setFormData] = useState(
    client || {
      name: "",
      email: "",
      phone: "",
      plan: "BASIC",
      status: "ACTIVE",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
      endDate: formData.endDate ? new Date(formData.endDate) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {client ? "Editar Cliente" : "Nuevo Cliente"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... Tus inputs originales ... */}
            <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input
              type="tel"
              value={formData.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Plan</label>
              <select
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                className="w-full cursor-pointer rounded-lg border border-border bg-background px-4 py-2"
              >
                <option value="BASIC">Básico</option>
                <option value="PREMIUM">Premium</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full cursor-pointer rounded-lg border border-border bg-background px-4 py-2"
              >
                <option value="ACTIVE">Activo</option>
                <option value="EXPIRED">Vencido</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={formData.startDate ? formData.startDate.split("T")[0] : ""}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Fin</label>
              <input
                type="date"
                value={formData.endDate ? formData.endDate.split("T")[0] : ""}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 cursor-pointer">
              {client ? "Guardar" : "Crear"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}