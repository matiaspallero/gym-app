import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()
    const reservation = await prisma.reservation.update({ 
      where: { id }, 
      data,
      include: { member: true, class: true }
    })
    return NextResponse.json(reservation)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar reservación' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await prisma.reservation.delete({ where: { id } })
    return NextResponse.json({ message: 'Reservación eliminada' })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar reservación' }, { status: 500 })
  }
}