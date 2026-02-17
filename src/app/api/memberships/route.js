import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const memberships = await prisma.membership.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(memberships)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener membresías' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const newMembership = await prisma.membership.create({ 
      data: {
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.price),
        duration: parseInt(data.duration),
        benefits: data.benefits || [],
        isActive: data.isActive ?? true,
      }
    })
    return NextResponse.json(newMembership)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al crear membresía' }, { status: 500 })
  }
}
