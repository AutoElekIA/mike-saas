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

    const roles = await prisma.administrationRole.findMany({
      where: {
        period: {
          condominium: {
            tenantId: session.user.tenantId,
          },
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        period: true,
      },
      orderBy: {
        period: {
          semester: 'desc',
        },
      },
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener roles' },
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

    const { userId, periodId, roleType } = await request.json();

    if (!userId || !periodId || !roleType) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    const role = await prisma.administrationRole.create({
      data: {
        userId,
        periodId,
        roleType,
        isActive: true,
      },
      include: {
        user: true,
        period: true,
      },
    });

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al crear rol' },
      { status: 500 }
    );
  }
}