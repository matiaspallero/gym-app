import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { id } = await params
  try {
    const member = await prisma.member.findUnique({ where: { id } })
    if (!member) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(member)
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  const { id } = await params
  try {
    const data = await request.json()
    const member = await prisma.member.update({ where: { id }, data })
    return NextResponse.json(member)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params
  try {
    await prisma.member.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}
