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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'person' o 'property'
    const id = formData.get('id') as string;

    if (!file || !type || !id) {
      return NextResponse.json(
        { error: 'Faltan archivo, tipo o ID' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato no permitido. Use JPG o PNG' },
        { status: 400 }
      );
    }

    // Validar tamaño (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Archivo demasiado grande. Máximo 2MB' },
        { status: 400 }
      );
    }

    // Crear carpeta de uploads
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'photos');
    await mkdir(uploadDir, { recursive: true });

    // Guardar archivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = file.type.split('/')[1];
    const fileName = `${type}-${id}-${Date.now()}.${extension}`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const photoUrl = `/uploads/photos/${fileName}`;

    // Actualizar según el tipo
    let updated;
    if (type === 'person') {
      updated = await prisma.person.update({
        where: { id },
        data: { photoUrl },
      });
    } else if (type === 'property') {
      updated = await prisma.property.update({
        where: { id },
        data: { photoUrl },
      });
    } else {
      return NextResponse.json(
        { error: 'Tipo no válido. Use "person" o "property"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Foto subida correctamente',
      photoUrl,
      updated,
    });
  } catch (error) {
    console.error('Error subiendo foto:', error);
    return NextResponse.json(
      { error: 'Error al subir foto', details: String(error) },
      { status: 500 }
    );
  }
}