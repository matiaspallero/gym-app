import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(members)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const member = await prisma.member.create({ data })
    return NextResponse.json(member)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al crear cliente' }, { status: 500 })
  }
}