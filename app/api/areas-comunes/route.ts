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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const commonAreas = await prisma.commonArea.findMany({
      where: {
        condominium: {
          tenantId: session.user.tenantId,
        },
      },
      include: {
        reservations: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
          orderBy: {
            startTime: 'asc',
          },
          take: 5,
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(commonAreas);
  } catch (error) {
    console.error('Error al obtener áreas comunes:', error);
    return NextResponse.json(
      { error: 'Error al obtener áreas comunes', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, maxCapacity, pricePerHour, requiresApproval } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    // Buscar un condominio del tenant
    const condominium = await prisma.condominium.findFirst({
      where: { tenantId: session.user.tenantId },
    });

    if (!condominium) {
      return NextResponse.json(
        { error: 'No se encontró un condominio asociado' },
        { status: 400 }
      );
    }

    const commonArea = await prisma.commonArea.create({
      data: {
        name,
        description: description || null,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
        pricePerHour: pricePerHour ? parseFloat(pricePerHour) : null,
        requiresApproval: requiresApproval !== undefined ? requiresApproval : true,
        condominiumId: condominium.id,
      },
    });

    return NextResponse.json({ success: true, commonArea });
  } catch (error) {
    console.error('Error al crear área común:', error);
    return NextResponse.json(
      { error: 'Error al crear área común', details: String(error) },
      { status: 500 }
    );
  }
}