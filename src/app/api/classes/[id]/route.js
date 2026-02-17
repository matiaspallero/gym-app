import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()
    const updated = await prisma.class.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar clase' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await prisma.class.delete({ where: { id } })
    return NextResponse.json({ message: 'Clase eliminada' })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar clase' }, { status: 500 })
  }
}