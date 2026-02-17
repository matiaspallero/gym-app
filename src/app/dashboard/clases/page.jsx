"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function ClasesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [selectedDay, setSelectedDay] = useState("Todos");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      const data = await res.json();
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = selectedDay === "Todos"
    ? classes
    : classes.filter((c) => c.day === selectedDay);

  const handleDelete = async (id) => {
    if (confirm("¿Eliminar esta clase?")) {
      try {
        await fetch(`/api/classes/${id}`, { method: "DELETE" });
        setClasses(classes.filter((c) => c.id !== id));
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleEdit = (cls) => {
    setEditingClass(cls);
    setShowModal(true);
  };

  const handleSave = async (data) => {
    try {
      if (editingClass) {
        const res = await fetch(`/api/classes/${editingClass.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const updated = await res.json();
        setClasses(classes.map((c) => (c.id === editingClass.id ? updated : c)));
      } else {
        const res = await fetch("/api/classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const newClass = await res.json();
        setClasses([newClass, ...classes]);
      }
      setShowModal(false);
      setEditingClass(null);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando clases...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Clases</h1>
          <p className="text-muted-foreground">Gestiona las clases de tu gimnasio</p>
        </div>
        <Button onClick={() => { setEditingClass(null); setShowModal(true); }} className="w-full sm:w-auto cursor-pointer">
          + Nueva Clase
        </Button>
      </div>

      {/* Filtro por día */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedDay === "Todos" ? "default" : "outline"}
          onClick={() => setSelectedDay("Todos")}
          size="sm"
          className="cursor-pointer"
        >
          Todos
        </Button>
        {days.map((day) => (
          <Button
            key={day}
            variant={selectedDay === day ? "default" : "outline"}
            onClick={() => setSelectedDay(day)}
            size="sm"
            className="whitespace-nowrap cursor-pointer"
          >
            {day}
          </Button>
        ))}
      </div>

      {/* Grid de clases */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredClasses.map((cls) => (
          <Card key={cls.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{cls.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{cls.instructor}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(cls)} className="text-gray-400 hover:text-primary text-sm hover:underline cursor-pointer"> <Edit className="w-5 h-5 inline mr-1" /></button>
                  <span className="text-muted-foreground">|</span>
                  <button onClick={() => handleDelete(cls.id)} className="text-gray-400 hover:text-primary text-sm hover:underline cursor-pointer"><Trash2 className="w-5 h-5 inline mr-1" /></button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Día:</span> {cls.day}</p>
                <p><span className="font-medium">Hora:</span> {cls.time}</p>
                <p><span className="font-medium">Duración:</span> {cls.duration} min</p>
                <p><span className="font-medium">Capacidad:</span> {cls.capacity} personas</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredClasses.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12">
            No hay clases registradas
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ClassModal
          classData={editingClass}
          onClose={() => { setShowModal(false); setEditingClass(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function ClassModal({ classData, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: classData?.name || "",
    instructor: classData?.instructor || "",
    day: classData?.day || "Lunes",
    time: classData?.time || "09:00",
    duration: classData?.duration || 60,
    capacity: classData?.capacity || 20,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      duration: parseInt(formData.duration),
      capacity: parseInt(formData.capacity),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {classData ? "Editar Clase" : "Nueva Clase"}
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Instructor</label>
            <input
              type="text"
              required
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Día</label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-2 cursor-pointer"
              >
                {days.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hora</label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Duración (min)</label>
              <input
                type="number"
                required
                min="15"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Capacidad</label>
              <input
                type="number"
                required
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 cursor-pointer hover:bg-secondary/90">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 cursor-pointer hover:bg-primary/80">
              {classData ? "Guardar" : "Crear"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}