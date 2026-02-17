import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()
    const payment = await prisma.payment.update({ 
      where: { id }, 
      data,
      include: { member: true }
    })
    return NextResponse.json(payment)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar pago' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await prisma.payment.delete({ where: { id } })
    return NextResponse.json({ message: 'Pago eliminado' })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar pago' }, { status: 500 })
  }
}