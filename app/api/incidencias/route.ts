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

    // Obtener incidencias del tenant
    const incidents = await prisma.incident.findMany({
      where: {
        condominium: {
          tenantId: session.user.tenantId,
        },
      },
      include: {
        reporter: {
          select: { name: true, email: true },
        },
        assignedUser: {
          select: { name: true, email: true },
        },
        condominium: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(incidents);
  } catch (error) {
    console.error('Error al obtener incidencias:', error);
    return NextResponse.json(
      { error: 'Error al obtener incidencias', details: String(error) },
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
    const { title, description, priority, propertyId } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Título y descripción son requeridos' },
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

    const incident = await prisma.incident.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        status: 'PENDING',
        reportedBy: session.user.id,
        condominiumId: condominium.id,
        propertyId: propertyId || null,
      },
      include: {
        reporter: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, incident });
  } catch (error) {
    console.error('Error al crear incidencia:', error);
    return NextResponse.json(
      { error: 'Error al crear incidencia', details: String(error) },
      { status: 500 }
    );
  }
}