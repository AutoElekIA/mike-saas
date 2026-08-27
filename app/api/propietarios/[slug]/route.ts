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

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // Esperar a que params se resuelva (Next.js 16)
    const { slug } = await context.params;
    
    console.log('📥 ID recibido en API:', slug);

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!slug) {
      return NextResponse.json(
        { error: 'ID de propietario requerido' },
        { status: 400 }
      );
    }

    const person = await prisma.person.findUnique({
      where: { id: slug },
      include: {
        properties: {
          include: {
            property: {
              include: {
                unit: {
                  include: {
                    building: true,
                  },
                },
                lot: true,
                condominium: true,
              },
            },
          },
        },
      },
    });

    if (!person) {
      return NextResponse.json(
        { error: 'Propietario no encontrado' },
        { status: 404 }
      );
    }

    const payments = await prisma.payment.findMany({
      where: {
        propertyOwner: {
          personId: slug,
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
    });

    const owner = {
      id: person.id,
      fullName: person.fullName,
      photoUrl: person.photoUrl,
      email: person.email,
      phone: person.phone,
      documentId: person.documentId,
      properties: person.properties.map(po => ({
        property: {
          id: po.property.id,
          code: po.property.code,
          areaM2: po.property.areaM2,
          maintenanceFee: po.property.maintenanceFee,
          type: po.property.type,
          address: po.property.lot?.address || 
            (po.property.unit?.building ? `Torre ${po.property.unit.building.name}` : null),
          photoUrl: po.property.photoUrl,
        },
        status: po.status,
        ownershipSince: po.ownershipSince,
      })),
      payments: payments.map(p => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        dueDate: p.dueDate,
        paidAt: p.paidAt,
        voucherUrl: p.voucherUrl,
      })),
    };

    return NextResponse.json(owner);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener propietario', details: String(error) },
      { status: 500 }
    );
  }
}