import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:656bda0e6fb148fbbcfbe16e8e5cf073@localhost:5432/mike_saas?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month') || new Date().toISOString().slice(0, 7);
    const [year, month] = monthParam.split('-').map(Number);
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    console.log('📊 Finanzas - Mes:', monthParam);
    console.log('📊 Tenant ID:', session.user.tenantId);

    const allPayments = await prisma.payment.findMany({
      where: {
        tenantId: session.user.tenantId,
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        propertyOwner: {
          include: {
            person: true,
            property: true,
          },
        },
      },
    });

    console.log(`📊 Pagos encontrados: ${allPayments.length}`);

    const totalIncome = allPayments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPending = allPayments
      .filter(p => p.status === 'PENDING' || p.status === 'OVERDUE')
      .reduce((sum, p) => sum + p.amount, 0);

    const paidCount = allPayments.filter(p => p.status === 'PAID').length;
    const pendingCount = allPayments.filter(p => p.status === 'PENDING').length;
    const overdueCount = allPayments.filter(p => p.status === 'OVERDUE').length;

    const totalProperties = await prisma.property.count({
      where: {
        condominium: {
          tenantId: session.user.tenantId,
        },
      },
    });

    const expenses = await prisma.expense.findMany({
      where: {
        condominium: {
          tenantId: session.user.tenantId,
        },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(year, month - 1), i);
      const s = startOfMonth(d);
      const e = endOfMonth(d);
      
      const monthlyPayments = await prisma.payment.findMany({
        where: {
          tenantId: session.user.tenantId,
          status: 'PAID',
          paidAt: {
            gte: s,
            lte: e,
          },
        },
      });

      const monthlyExpenses = await prisma.expense.findMany({
        where: {
          condominium: {
            tenantId: session.user.tenantId,
          },
          date: {
            gte: s,
            lte: e,
          },
        },
      });

      monthlyData.push({
        month: format(d, 'MMM yyyy'),
        income: monthlyPayments.reduce((sum, p) => sum + p.amount, 0),
        expenses: monthlyExpenses.reduce((sum, e) => sum + e.amount, 0),
      });
    }

    const response = {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      pendingPayments: totalPending,
      totalProperties,
      paidCount,
      pendingCount,
      overdueCount,
      monthlyData,
    };

    console.log('📊 Respuesta enviada:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error en finanzas:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos financieros', details: String(error) },
      { status: 500 }
    );
  }
}