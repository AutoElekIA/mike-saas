import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:656bda0e6fb148fbbcfbe16e8e5cf073@localhost:5432/mike_saas?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener el tenantId del usuario
    const tenantId = session.user?.tenantId;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Usuario sin tenant asignado' },
        { status: 400 }
      );
    }

    // Obtener personas con propiedades del tenant usando la relación correcta
    const people = await prisma.person.findMany({
      where: {
        properties: {
          some: {
            property: {
              condominium: {
                tenantId: tenantId,
              },
            },
          },
        },
      },
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
    const directors = people.map(person => ({
      id: person.id,
      fullName: person.fullName,
      email: person.email,
      phone: person.phone,
      properties: person.properties.map(po => {
        const prop = po.property;
        let address = prop.code || '';
        if (prop.unit?.building) {
          address = `Torre ${prop.unit.building.name}, ${prop.code}`;
        } else if (prop.lot) {
          address = prop.lot.address || `Lote ${prop.code}`;
        }
        return {
          id: prop.id,
          code: prop.code,
          address: address,
          type: prop.type,
        };
      }),
    }));

    return NextResponse.json(directors);
  } catch (error) {
    console.error('Error en directorio:', error);
    return NextResponse.json(
      { error: 'Error al obtener directorio', details: String(error) },
      { status: 500 }
    );
  }
}