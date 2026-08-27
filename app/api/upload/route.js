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

export async function POST(request) {
  try {
    console.log('📤 Iniciando subida de comprobante...');
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const paymentId = formData.get('paymentId');

    if (!file || !paymentId) {
      return NextResponse.json(
        { error: 'Faltan archivo o ID de pago' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato no permitido. Use JPG, PNG o PDF' },
        { status: 400 }
      );
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Archivo demasiado grande. Máximo 5MB' },
        { status: 400 }
      );
    }

    // Crear carpeta de uploads si no existe
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'vouchers');
    await mkdir(uploadDir, { recursive: true });

    // Guardar archivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = file.type === 'application/pdf' ? 'pdf' : 'jpg';
    const fileName = `${paymentId}-${Date.now()}.${extension}`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // URL pública del archivo
    const publicUrl = `/uploads/vouchers/${fileName}`;

    // Actualizar el pago
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        voucherUrl: publicUrl,
        voucherVerified: false,
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

    return NextResponse.json({
      success: true,
      message: 'Comprobante subido correctamente',
      payment,
    });
  } catch (error) {
    console.error('Error subiendo comprobante:', error);
    return NextResponse.json(
      { error: 'Error al subir comprobante', details: String(error) },
      { status: 500 }
    );
  }
}