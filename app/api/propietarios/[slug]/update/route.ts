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

export async function PUT(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    console.log('📥 Actualizando propietario:', slug);

    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('❌ No autorizado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📦 Datos recibidos:', body);

    const { fullName, email, phone, documentId } = body;

    // Validar que al menos el nombre esté presente
    if (!fullName) {
      console.log('❌ Nombre requerido');
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const person = await prisma.person.update({
      where: { id: slug },
      data: {
        fullName,
        email: email || null,
        phone: phone || null,
        documentId: documentId || null,
      },
    });

    console.log('✅ Propietario actualizado:', person.id);
    return NextResponse.json({ success: true, person });
  } catch (error) {
    console.error('❌ Error en API:', error);
    return NextResponse.json(
      { error: 'Error al actualizar propietario', details: String(error) },
      { status: 500 }
    );
  }
}