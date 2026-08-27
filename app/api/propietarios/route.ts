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

    // Obtener TODAS las personas con sus propiedades
    const people = await prisma.person.findMany({
      include: {
        properties: {
          include: {
            property: {
              include: {
                condominium: true,
                unit: {
                  include: {
                    building: true,
                  },
                },
                lot: true,
              },
            },
          },
        },
      },
      orderBy: {
        fullName: 'asc',
      },
    });

    // Formatear respuesta
    const owners = people.map(person => ({
      id: person.id,
      fullName: person.fullName,
      email: person.email,
      phone: person.phone,
      documentId: person.documentId,
      photoUrl: person.photoUrl,
      properties: person.properties.map(po => ({
        property: {
          id: po.property.id,
          code: po.property.code,
          address: po.property.lot?.address || 
            (po.property.unit?.building ? `Torre ${po.property.unit.building.name}` : null),
        },
        status: po.status,
        ownershipSince: po.ownershipSince,
      })),
    }));

    return NextResponse.json(owners);
  } catch (error) {
    console.error('Error en propietarios:', error);
    return NextResponse.json(
      { error: 'Error al obtener propietarios', details: String(error) },
      { status: 500 }
    );
  }
}