import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { subDays } from 'date-fns';

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:656bda0e6fb148fbbcfbe16e8e5cf073@localhost:5432/mike_saas?schema=public";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed con datos completos...');

  // ============================================
  // 1. TENANT
  // ============================================
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Condominios del Valle',
      slug: 'condominios-del-valle',
      settings: {
        currency: 'MXN',
        timezone: 'America/Mexico_City',
        paymentConfig: {
          earlyPayment: 2000,
          latePayment: 2200,
          dueDay: 10,
        },
      },
    },
  });
  console.log(`✅ Tenant creado: ${tenant.name}`);

  // ============================================
  // 2. USUARIOS
  // ============================================
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@mike.com',
      name: 'Administrador Mike',
      password: adminPassword,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });
  console.log(`✅ Admin: admin@mike.com (admin123)`);

  const guestPassword = await bcrypt.hash('guest123', 10);
  const guest = await prisma.user.create({
    data: {
      email: 'guest@mike.com',
      name: 'Visitante',
      password: guestPassword,
      role: 'GUEST',
      tenantId: tenant.id,
    },
  });
  console.log(`✅ Guest: guest@mike.com (guest123)`);

  // Usuarios propietarios (residentes)
  const residentUsers = [];
  const residentNames = [
    'María García', 'Carlos López', 'Ana Martínez', 'Jorge Rodríguez', 
    'Laura Fernández', 'Miguel Sánchez', 'Patricia Gómez', 'Fernando Díaz',
    'Carmen Torres', 'Roberto Ruiz', 'Isabel Morales', 'Sergio Ortiz',
    'Raúl Jiménez', 'Mónica Castro', 'Alejandro Vega'
  ];

  for (const name of residentNames) {
    const email = name.toLowerCase().replace(/ /g, '.') + '@ejemplo.com';
    const pass = await bcrypt.hash('resident123', 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: pass,
        role: 'RESIDENT',
        tenantId: tenant.id,
      },
    });
    residentUsers.push(user);
  }
  console.log(`✅ ${residentUsers.length} residentes creados`);

  // ============================================
  // 3. CONDOMINIOS
  // ============================================
  // Vertical
  const vertical = await prisma.condominium.create({
    data: {
      name: 'Residencial Los Pinos',
      address: 'Av. Principal #123, Colonia Centro, CDMX',
      taxId: 'CONDO-2024-001',
      tenantId: tenant.id,
    },
  });
  console.log(`✅ Condominio Vertical: ${vertical.name}`);

  // Horizontal
  const horizontal = await prisma.condominium.create({
    data: {
      name: 'Fraccionamiento El Encanto',
      address: 'Carretera Libre #456, Ejido La Joya, Estado de México',
      taxId: 'CONDO-2024-002',
      tenantId: tenant.id,
    },
  });
  console.log(`✅ Condominio Horizontal: ${horizontal.name}`);

  // ============================================
  // 4. EDIFICIOS (Vertical)
  // ============================================
  const towerA = await prisma.building.create({
    data: {
      name: 'Torre A',
      description: 'Torre residencial de 10 pisos con vista al jardín',
      floors: 10,
      condominiumId: vertical.id,
    },
  });
  const towerB = await prisma.building.create({
    data: {
      name: 'Torre B',
      description: 'Torre residencial de 8 pisos con área de juegos',
      floors: 8,
      condominiumId: vertical.id,
    },
  });
  console.log(`✅ Torres creadas: ${towerA.name}, ${towerB.name}`);

  // ============================================
  // 5. UNIDADES Y PROPIEDADES (Vertical)
  // ============================================
  const verticalProperties = [];
  const unitTypes = ['APARTMENT', 'PENTHOUSE', 'APARTMENT', 'APARTMENT', 'COMMERCIAL'];

  for (let t = 0; t < 2; t++) {
    const tower = t === 0 ? towerA : towerB;
    const maxFloors = t === 0 ? 10 : 8;
    const unitsPerFloor = 4;

    for (let floor = 1; floor <= maxFloors; floor++) {
      for (let u = 1; u <= unitsPerFloor; u++) {
        const unitNumber = (floor - 1) * unitsPerFloor + u;
        const code = `${t === 0 ? 'A' : 'B'}-${String(floor).padStart(2, '0')}${String(u).padStart(2, '0')}`;
        const type = unitTypes[unitNumber % unitTypes.length] as any;
        const area = 70 + Math.floor(Math.random() * 60);
        const fee = 1200 + Math.floor(Math.random() * 1000);

        const unit = await prisma.unit.create({
          data: {
            code,
            floor,
            areaM2: area,
            type,
            maintenanceFee: fee,
            buildingId: tower.id,
          },
        });

        const property = await prisma.property.create({
          data: {
            code: unit.code,
            areaM2: area,
            maintenanceFee: fee,
            type: 'UNIT',
            unitId: unit.id,
            condominiumId: vertical.id,
          },
        });
        verticalProperties.push(property);
      }
    }
  }
  console.log(`✅ ${verticalProperties.length} unidades creadas`);

  // ============================================
  // 6. ZONAS Y LOTES (Horizontal)
  // ============================================
  const zones = [];
  const zoneNames = ['Sección A', 'Sección B', 'Sección C', 'Sección D'];
  for (const zName of zoneNames) {
    const zone = await prisma.zone.create({
      data: {
        name: zName,
        description: `${zName} - Zona residencial`,
        condominiumId: horizontal.id,
      },
    });
    zones.push(zone);
  }
  console.log(`✅ ${zones.length} zonas creadas`);

  const horizontalProperties = [];
  const streetNames = ['Calle Principal', 'Av. del Parque', 'Calle del Sol', 'Av. de las Flores'];

  for (let i = 1; i <= 30; i++) {
    const zone = zones[i % zones.length];
    const street = streetNames[i % streetNames.length];
    const code = `L-${String(i).padStart(3, '0')}`;
    const area = 150 + Math.floor(Math.random() * 150);
    const fee = 800 + Math.floor(Math.random() * 700);

    const lot = await prisma.lot.create({
      data: {
        code,
        areaM2: area,
        address: `${street} #${i}`,
        maintenanceFee: fee,
        zoneId: zone.id,
        condominiumId: horizontal.id,
      },
    });

    const property = await prisma.property.create({
      data: {
        code: lot.code,
        areaM2: area,
        maintenanceFee: fee,
        type: 'LOT',
        lotId: lot.id,
        condominiumId: horizontal.id,
      },
    });
    horizontalProperties.push(property);
  }
  console.log(`✅ ${horizontalProperties.length} lotes creados`);

  // ============================================
  // 7. PERSONAS (PROPIETARIOS)
  // ============================================
  const allProperties = [...verticalProperties, ...horizontalProperties];
  const people = [];

  for (let i = 0; i < allProperties.length; i++) {
    const prop = allProperties[i];
    const userIndex = i % residentUsers.length;
    const user = residentUsers[userIndex];

    let person = await prisma.person.findFirst({
      where: { 
        properties: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    if (!person) {
      person = await prisma.person.create({
        data: {
          fullName: user.name,
          email: user.email,
          phone: `55${String(1000 + Math.floor(Math.random() * 9000))}${String(1000 + Math.floor(Math.random() * 9000))}`,
        },
      });
      people.push(person);
    }

    await prisma.propertyOwner.create({
      data: {
        propertyId: prop.id,
        personId: person.id,
        userId: user.id,
        status: 'OWNER',
        ownershipSince: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      },
    });
  }
  console.log(`✅ ${people.length} propietarios asignados`);

  // ============================================
  // 8. PAGOS
  // ============================================
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let totalPayments = 0;

  for (let m = 0; m < 4; m++) {
    const month = (currentMonth - m + 12) % 12;
    const year = currentMonth - m < 0 ? currentYear - 1 : currentYear;
    const dueDate = new Date(year, month, 10);
    const isPast = dueDate < now;
    const isCurrentMonth = month === currentMonth && year === currentYear;

    let statusDistribution;
    if (isPast) {
      statusDistribution = ['PAID', 'PAID', 'PAID', 'PAID', 'PAID', 'PAID', 'PAID', 'OVERDUE', 'OVERDUE', 'OVERDUE'];
    } else if (isCurrentMonth) {
      statusDistribution = ['PAID', 'PAID', 'PAID', 'PAID', 'PENDING', 'PENDING', 'PENDING', 'PENDING', 'PENDING', 'OVERDUE'];
    } else {
      statusDistribution = Array(10).fill('PENDING');
    }

    for (const prop of allProperties) {
      const owner = await prisma.propertyOwner.findFirst({
        where: { propertyId: prop.id },
        include: { person: true },
      });

      if (!owner) continue;

      const status = statusDistribution[Math.floor(Math.random() * statusDistribution.length)];
      const amount = status === 'OVERDUE' ? 2200 : 2000;
      const paidAt = status === 'PAID' ? new Date(year, month, 5 + Math.floor(Math.random() * 10)) : null;

      await prisma.payment.create({
        data: {
          amount,
          status,
          dueDate,
          paidAt,
          propertyOwnerId: owner.id,
          tenantId: tenant.id,
          ...(status === 'PAID' && { paymentMethod: Math.random() > 0.5 ? 'SPEI' : 'BANK_TRANSFER' }),
          ...(Math.random() > 0.7 && status === 'PAID' && { voucherUrl: `/uploads/vouchers/test-${Date.now()}.jpg` }),
        },
      });
      totalPayments++;
    }
  }
  console.log(`✅ ${totalPayments} pagos generados`);

  // ============================================
  // 9. CATEGORÍAS DE GASTOS
  // ============================================
  const expenseCategories = [
    'Mantenimiento', 'Nómina', 'Servicios (Luz, Agua, Gas)', 
    'Seguridad', 'Administración', 'Jardinería', 'Limpieza', 
    'Materiales', 'Reparaciones', 'Seguros'
  ];

  for (const cat of expenseCategories) {
    await prisma.expenseCategory.create({
      data: {
        name: cat,
        type: 'EXPENSE',
        condominiumId: vertical.id,
      },
    });
    await prisma.expenseCategory.create({
      data: {
        name: cat,
        type: 'EXPENSE',
        condominiumId: horizontal.id,
      },
    });
  }
  console.log(`✅ ${expenseCategories.length} categorías creadas`);

  // ============================================
  // 10. GASTOS
  // ============================================
  for (let i = 0; i < 30; i++) {
    const date = subDays(new Date(), Math.floor(Math.random() * 90));
    const amount = 500 + Math.floor(Math.random() * 5000);
    const condominium = Math.random() > 0.5 ? vertical : horizontal;
    const category = await prisma.expenseCategory.findFirst({
      where: { 
        condominiumId: condominium.id,
        type: 'EXPENSE',
      },
      skip: Math.floor(Math.random() * expenseCategories.length),
    });

    if (category) {
      await prisma.expense.create({
        data: {
          amount,
          date,
          description: `${category.name} - ${['Mensual', 'Extraordinario', 'Emergencia'][Math.floor(Math.random() * 3)]}`,
          categoryId: category.id,
          condominiumId: condominium.id,
          ...(Math.random() > 0.7 && { receiptUrl: `/uploads/expenses/test-${Date.now()}.jpg` }),
        },
      });
    }
  }
  console.log(`✅ 30 gastos creados`);

  // ============================================
  // 11. INCIDENCIAS
  // ============================================
  const incidentTitles = [
    'Fuga de agua en el departamento 301',
    'Fallo en iluminación de pasillos',
    'Ruido excesivo en la noche',
    'Jardín descuidado',
    'Puerta de acceso principal dañada',
    'Ascensor fuera de servicio',
    'Fallo en sistema de riego',
    'Basura acumulada en áreas comunes',
    'Filtración en estacionamiento',
    'Fallo en calefacción'
  ];

  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const statuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

  for (let i = 0; i < 20; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
    const priority = priorities[Math.floor(Math.random() * priorities.length)] as any;
    const condominium = Math.random() > 0.5 ? vertical : horizontal;
    const randomUser = residentUsers[Math.floor(Math.random() * residentUsers.length)];

    await prisma.incident.create({
      data: {
        title: incidentTitles[Math.floor(Math.random() * incidentTitles.length)],
        description: `Detalle de la incidencia #${i+1}: ${['Se requiere atención urgente', 'Programado para esta semana', 'En revisión'][Math.floor(Math.random() * 3)]}`,
        status,
        priority,
        reportedBy: randomUser.id,
        condominiumId: condominium.id,
        ...(status !== 'PENDING' && { assignedTo: admin.id }),
      },
    });
  }
  console.log(`✅ 20 incidencias creadas`);

  // ============================================
  // 12. ÁREAS COMUNES
  // ============================================
  const commonAreas = [
    { name: 'Salón de Eventos', description: 'Salón para fiestas y reuniones', maxCapacity: 50, pricePerHour: 500, requiresApproval: true },
    { name: 'Alberca', description: 'Alberca techada con calefacción', maxCapacity: 30, pricePerHour: 0, requiresApproval: false },
    { name: 'Gimnasio', description: 'Gimnasio completamente equipado', maxCapacity: 20, pricePerHour: 0, requiresApproval: false },
    { name: 'Jardín', description: 'Jardín con asadores y áreas verdes', maxCapacity: 40, pricePerHour: 300, requiresApproval: true },
    { name: 'Cancha de Tenis', description: 'Cancha de tenis con iluminación', maxCapacity: 8, pricePerHour: 200, requiresApproval: true },
    { name: 'Sala de Cine', description: 'Sala de cine con capacidad para 15 personas', maxCapacity: 15, pricePerHour: 250, requiresApproval: true },
  ];

  for (const area of commonAreas) {
    await prisma.commonArea.create({
      data: {
        name: area.name,
        description: area.description,
        maxCapacity: area.maxCapacity,
        pricePerHour: area.pricePerHour,
        requiresApproval: area.requiresApproval,
        condominiumId: vertical.id,
      },
    });
  }
  console.log(`✅ ${commonAreas.length} áreas comunes creadas`);

  // ============================================
  // 13. MINUTAS
  // ============================================
  const minuteTitles = [
    'Acta de Asamblea General 2024',
    'Acta de Asamblea General 2025',
    'Acta de Asamblea Extraordinaria',
    'Acta de Reunión del Comité',
    'Acta de Reunión de Vecinos'
  ];

  for (let i = 0; i < 5; i++) {
    const date = subDays(new Date(), Math.floor(Math.random() * 180));
    await prisma.minute.create({
      data: {
        title: minuteTitles[i % minuteTitles.length],
        content: `Resumen de la ${minuteTitles[i % minuteTitles.length]} realizada el ${date.toLocaleDateString('es-MX')}. Se trataron temas relacionados con el mantenimiento y la administración del condominio.`,
        meetingDate: date,
        fileUrl: Math.random() > 0.5 ? `/uploads/minutas/minuta-${i+1}.pdf` : null,
        condominiumId: vertical.id,
        createdBy: admin.id,
      },
    });
  }
  console.log(`✅ 5 minutas creadas`);

  // ============================================
  // 14. ADMINISTRACIÓN (PERIODOS Y ROLES)
  // ============================================
  const periods = [
    { semester: '2024-1', start: new Date(2024, 0, 1), end: new Date(2024, 5, 30) },
    { semester: '2024-2', start: new Date(2024, 6, 1), end: new Date(2024, 11, 31) },
    { semester: '2025-1', start: new Date(2025, 0, 1), end: new Date(2025, 5, 30) },
    { semester: '2025-2', start: new Date(2025, 6, 1), end: new Date(2025, 11, 31) },
    { semester: '2026-1', start: new Date(2026, 0, 1), end: new Date(2026, 5, 30) },
    { semester: '2026-2', start: new Date(2026, 6, 1), end: new Date(2026, 11, 31) },
  ];

  const roleTypes = ['TREASURER', 'MAINTENANCE', 'SECRETARY', 'PRESIDENT'];

  for (const period of periods) {
    const createdPeriod = await prisma.administrationPeriod.create({
      data: {
        condominiumId: vertical.id,
        semester: period.semester,
        startDate: period.start,
        endDate: period.end,
      },
    });

    if (period.semester.includes('2025') || period.semester.includes('2026')) {
      for (let r = 0; r < roleTypes.length; r++) {
        const user = residentUsers[r % residentUsers.length];
        await prisma.administrationRole.create({
          data: {
            periodId: createdPeriod.id,
            userId: user.id,
            roleType: roleTypes[r] as any,
            isActive: true,
          },
        });
      }
    }
  }
  console.log(`✅ ${periods.length} periodos y roles creados`);

  // ============================================
  // 15. ANUNCIOS
  // ============================================
  const announcements = [
    { title: 'Recordatorio: Pago de cuotas', content: 'Los pagos de cuotas deben realizarse antes del día 10 de cada mes.' },
    { title: 'Nuevo horario de áreas comunes', content: 'A partir del 1 de septiembre, las áreas comunes estarán abiertas de 7am a 10pm.' },
    { title: 'Convocatoria a asamblea', content: 'Se convoca a la asamblea general para el día 15 de septiembre.' },
    { title: 'Mantenimiento programado', content: 'El día 20 de septiembre se realizará mantenimiento en el sistema eléctrico.' },
  ];

  for (const ann of announcements) {
    await prisma.announcement.create({
      data: {
        title: ann.title,
        content: ann.content,
        publishedAt: subDays(new Date(), Math.floor(Math.random() * 30)),
        condominiumId: vertical.id,
      },
    });
  }
  console.log(`✅ ${announcements.length} anuncios creados`);

  // ============================================
  // RESUMEN FINAL
  // ============================================
  console.log('\n🎉 ¡Seed completado exitosamente!');
  console.log('📋 Resumen de datos creados:');
  console.log(`   - Usuarios: ${2 + residentUsers.length}`);
  console.log(`   - Propietarios: ${people.length}`);
  console.log(`   - Propiedades: ${allProperties.length}`);
  console.log(`   - Pagos: ${totalPayments}`);
  console.log(`   - Incidencias: 20`);
  console.log(`   - Áreas Comunes: ${commonAreas.length}`);
  console.log(`   - Minutas: 5`);
  console.log(`   - Anuncios: ${announcements.length}`);
  console.log(`   - Periodos: ${periods.length}`);
  console.log('\n🔐 Credenciales:');
  console.log(`   - Admin: admin@mike.com / admin123`);
  console.log(`   - Guest: guest@mike.com / guest123`);
  console.log(`   - Residentes: cualquier email residente / resident123`);
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });