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

    // Buscar un condominio del tenant
    const condominium = await prisma.condominium.findFirst({
      where: { tenantId: session.user.tenantId },
    });

    if (!condominium) {
      return NextResponse.json(
        { error: 'No se encontró un condominio para este tenant' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un período para evitar duplicados
    const existingPeriod = await prisma.administrationPeriod.findFirst({
      where: {
        condominiumId: condominium.id,
        semester: '2026-2',
      },
    });

    if (existingPeriod) {
      return NextResponse.json({
        message: 'El período ya existe',
        period: existingPeriod,
      });
    }

    // Crear período actual (2026-2)
    const period = await prisma.administrationPeriod.create({
      data: {
        condominiumId: condominium.id,
        semester: '2026-2',
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-12-31'),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Período creado correctamente',
      period,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al crear período', details: String(error) },
      { status: 500 }
    );
  }
}