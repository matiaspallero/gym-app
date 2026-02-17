"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Check } from "lucide-react";

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMembership, setEditingMembership] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      const res = await fetch("/api/memberships");
      const data = await res.json();
      setMemberships(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando membresías:", error);
      setMemberships([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMemberships = memberships.filter((m) => {
    const matchesSearch = m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && m.isActive) || 
      (filterStatus === "inactive" && !m.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de eliminar esta membresía?")) {
      try {
        await fetch(`/api/memberships/${id}`, { method: "DELETE" });
        setMemberships(memberships.filter((m) => m.id !== id));
      } catch (error) {
        console.error("Error eliminando membresía:", error);
      }
    }
  };

  const handleEdit = (membership) => {
    setEditingMembership(membership);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingMembership(null);
    setShowModal(true);
  };

  const handleSave = async (data) => {
    try {
      if (editingMembership) {
        const res = await fetch(`/api/memberships/${editingMembership.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const updated = await res.json();
        setMemberships(memberships.map((m) => (m.id === editingMembership.id ? updated : m)));
      } else {
        const res = await fetch("/api/memberships", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const newMembership = await res.json();
        setMemberships([newMembership, ...memberships]);
      }
      setShowModal(false);
      setEditingMembership(null);
    } catch (error) {
      console.error("Error guardando membresía:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando membresías...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Membresías</h1>
          <p className="text-muted-foreground">Gestiona los planes de membresía de tu gimnasio</p>
        </div>
        <Button onClick={handleAddNew} className="w-full sm:w-auto cursor-pointer hover:bg-primary/80">
          + Nueva Membresía
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg cursor-pointer border border-border bg-background px-4 py-2"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Grid de membresías */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMemberships.map((membership) => (
          <Card key={membership.id} className={!membership.isActive ? "opacity-60" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{membership.name}</CardTitle>
                  <p className="text-2xl font-bold text-primary mt-1">
                    ${membership.price.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{membership.duration} {membership.duration === 1 ? "mes" : "meses"}
                    </span>
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(membership)}
                    className="text-gray-400 hover:text-primary text-sm hover:underline cursor-pointer"
                  >
                    <Edit className="w-5 h-5 inline" />
                  </button>
                  <span className="text-muted-foreground">|</span>
                  <button
                    onClick={() => handleDelete(membership.id)}
                    className="text-gray-400 hover:text-destructive text-sm hover:underline cursor-pointer"
                  >
                    <Trash2 className="w-5 h-5 inline" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {membership.description && (
                  <p className="text-sm text-muted-foreground">{membership.description}</p>
                )}
                
                {membership.benefits && membership.benefits.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Beneficios:</p>
                    <ul className="space-y-1">
                      {membership.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    membership.isActive
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}>
                    {membership.isActive ? "Activa" : "Inactiva"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredMemberships.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12">
            No hay membresías registradas
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <MembershipModal
          membershipData={editingMembership}
          onClose={() => { setShowModal(false); setEditingMembership(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function MembershipModal({ membershipData, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: membershipData?.name || "",
    description: membershipData?.description || "",
    price: membershipData?.price || "",
    duration: membershipData?.duration || 1,
    benefits: membershipData?.benefits?.join("\n") || "",
    isActive: membershipData?.isActive ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const benefits = formData.benefits
      .split("\n")
      .map((b) => b.trim())
      .filter((b) => b.length > 0);
    
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      benefits,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {membershipData ? "Editar Membresía" : "Nueva Membresía"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-2"
              placeholder="Ej: Plan Premium"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-2"
              placeholder="Ej: Acceso completo a todas las instalaciones"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Precio ($)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duración (meses)</label>
              <input
                type="number"
                required
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Beneficios <span className="text-muted-foreground">(uno por línea)</span>
            </label>
            <textarea
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-2 min-h-25"
              placeholder={"Acceso ilimitado\nClases grupales\nVestuarios"}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-input cursor-pointer"
            />
            <label htmlFor="isActive" className="text-sm cursor-pointer">
              Membresía activa
            </label>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 cursor-pointer hover:bg-secondary/90"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 cursor-pointer hover:bg-primary/80"
            >
              {membershipData ? "Guardar" : "Crear"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}