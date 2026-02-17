import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const membership = await prisma.membership.findUnique({ where: { id } })
    if (!membership) {
      return NextResponse.json({ error: 'Membresía no encontrada' }, { status: 404 })
    }
    return NextResponse.json(membership)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener membresía' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()
    const updated = await prisma.membership.update({ 
      where: { id }, 
      data: {
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.price),
        duration: parseInt(data.duration),
        benefits: data.benefits || [],
        isActive: data.isActive ?? true,
      }
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar membresía' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await prisma.membership.delete({ where: { id } })
    return NextResponse.json({ message: 'Membresía eliminada' })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar membresía' }, { status: 500 })
  }
}
