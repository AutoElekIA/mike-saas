import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
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

    const minutes = await prisma.minute.findMany({
      where: {
        condominium: {
          tenantId: session.user.tenantId,
        },
      },
      include: {
        creator: {
          select: { name: true },
        },
        condominium: {
          select: { name: true },
        },
      },
      orderBy: {
        meetingDate: 'desc',
      },
    });

    return NextResponse.json(minutes);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener minutas' },
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

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const meetingDate = formData.get('meetingDate') as string;
    const file = formData.get('file') as File | null;

    if (!title || !meetingDate) {
      return NextResponse.json(
        { error: 'Título y fecha son requeridos' },
        { status: 400 }
      );
    }

    let fileUrl: string | null = null;

    if (file) {
      // Validar que sea PDF
      if (file.type !== 'application/pdf') {
        return NextResponse.json(
          { error: 'Solo se permiten archivos PDF' },
          { status: 400 }
        );
      }

      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Archivo demasiado grande. Máximo 5MB' },
          { status: 400 }
        );
      }

      // Guardar archivo
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'minutas');
      await mkdir(uploadDir, { recursive: true });

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      fileUrl = `/uploads/minutas/${fileName}`;
    }

    // Obtener el condominio del usuario
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true },
    });

    // Buscar un condominio del tenant
    const condominium = await prisma.condominium.findFirst({
      where: { tenantId: user?.tenantId || '' },
    });

    if (!condominium) {
      return NextResponse.json(
        { error: 'No se encontró un condominio asociado' },
        { status: 400 }
      );
    }

    const minute = await prisma.minute.create({
      data: {
        title,
        content: content || '',
        meetingDate: new Date(meetingDate),
        fileUrl,
        condominiumId: condominium.id,
        createdBy: session.user.id,
      },
      include: {
        creator: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      minute,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al crear minuta', details: String(error) },
      { status: 500 }
    );
  }
}