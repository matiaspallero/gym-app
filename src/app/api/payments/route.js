import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: { member: true },
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(payments)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener pagos' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const payment = await prisma.payment.create({
      data,
      include: { member: true }
    })
    return NextResponse.json(payment)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al crear pago' }, { status: 500 })
  }
}