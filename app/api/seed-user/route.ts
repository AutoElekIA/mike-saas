import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

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

    // Verificar si ya existe el usuario
    const existing = await prisma.user.findFirst({
      where: { email: 'juan@example.com' },
    });

    if (existing) {
      return NextResponse.json({
        message: 'El usuario ya existe',
        user: existing,
      });
    }

    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'juan@example.com',
        name: 'Juan Pérez',
        password: hashedPassword,
        role: 'RESIDENT',
        tenantId: session.user.tenantId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Usuario creado correctamente',
      user,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al crear usuario', details: String(error) },
      { status: 500 }
    );
  }
}