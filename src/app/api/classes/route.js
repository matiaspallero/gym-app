import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      orderBy: { day: 'asc' }
    })
    return NextResponse.json(classes)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener clases' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const newClass = await prisma.class.create({ data })
    return NextResponse.json(newClass)
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear clase' }, { status: 500 })
  }
}