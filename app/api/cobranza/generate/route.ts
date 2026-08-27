import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { startOfMonth, endOfMonth, addDays, format } from 'date-fns';

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

    const tenantId = session.user.tenantId;
    const now = new Date();
    const startDate = startOfMonth(now);
    const endDate = endOfMonth(now);

    // Obtener todas las propiedades con sus propietarios
    const properties = await prisma.property.findMany({
      where: {
        condominium: {
          tenantId: tenantId,
        },
      },
      include: {
        owners: {
          include: {
            person: true,
          },
          where: {
            status: 'OWNER',
          },
        },
      },
    });

    let generated = 0;

    for (const property of properties) {
      for (const owner of property.owners) {
        // Verificar si ya existe pago para este mes
        const existing = await prisma.payment.findFirst({
          where: {
            propertyOwnerId: owner.id,
            dueDate: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        if (!existing) {
          // Calcular monto: 2000 si es dentro del mes, 2200 si es después
          const dueDate = addDays(startDate, 10);
          const isLate = now > dueDate;
          const amount = isLate ? 2200 : 2000;

          await prisma.payment.create({
            data: {
              amount: amount,
              dueDate: dueDate,
              status: isLate ? 'OVERDUE' : 'PENDING',
              propertyOwnerId: owner.id,
              tenantId: tenantId,
            },
          });
          generated++;
        }
      }
    }

    return NextResponse.json({
      message: `Generados ${generated} pagos para ${format(now, 'MMMM yyyy')}`,
      generated,
    });
  } catch (error) {
    console.error('Error generando pagos:', error);
    return NextResponse.json(
      { error: 'Error al generar pagos', details: String(error) },
      { status: 500 }
    );
  }
}