import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      include: { member: true, class: true },
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(reservations)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener reservaciones' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const reservation = await prisma.reservation.create({
      data,
      include: { member: true, class: true }
    })
    return NextResponse.json(reservation)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al crear reservación' }, { status: 500 })
  }
}