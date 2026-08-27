import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:656bda0e6fb148fbbcfbe16e8e5cf073@localhost:5432/mike_saas?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { commonAreaId, startTime, endTime, notes } = body;

    if (!commonAreaId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verificar disponibilidad
    const overlapping = await prisma.reservation.findFirst({
      where: {
        commonAreaId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } },
            ],
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } },
            ],
          },
          {
            AND: [
              { startTime: { gte: new Date(startTime) } },
              { endTime: { lte: new Date(endTime) } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: 'La fecha/hora no está disponible' },
        { status: 409 }
      );
    }

    // Obtener el área para saber si requiere aprobación
    const area = await prisma.commonArea.findUnique({
      where: { id: commonAreaId },
      select: { requiresApproval: true },
    });

    const reservation = await prisma.reservation.create({
      data: {
        commonAreaId,
        userId: session.user.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        notes: notes || null,
        status: area?.requiresApproval ? 'PENDING' : 'APPROVED',
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
        commonArea: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({ success: true, reservation });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    return NextResponse.json(
      { error: 'Error al crear reserva', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { reservationId, status } = body;

    if (!reservationId || !status) {
      return NextResponse.json(
        { error: 'ID de reserva y estado son requeridos' },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status },
      include: {
        user: {
          select: { name: true, email: true },
        },
        commonArea: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({ success: true, reservation });
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    return NextResponse.json(
      { error: 'Error al actualizar reserva', details: String(error) },
      { status: 500 }
    );
  }
}