import { RequestType } from 'src/request_type/request_type.entity';
import { DataSource } from 'typeorm';

export async function seedRequestType(dataSource: DataSource) {
  const repository = dataSource.getRepository(RequestType);

  const count = await repository.count();

  if (count > 0) {
    // Tipos agregados después de la carga inicial
    const enProceso = await repository.findOneBy({ code: 'TICKET_IN_PROCESS' });
    if (!enProceso) {
      await repository.save({
        short_name: 'Colocar en proceso',
        long_name: 'Solicitud para colocar un ticket en proceso',
        code: 'TICKET_IN_PROCESS',
        emoji: '⏳',
        is_active: true,
      });
      console.log('RequestType TICKET_IN_PROCESS agregado');
    }
    console.log('RequestType ya existe');
    return;
  }

  await repository.save([
    {
      short_name: 'Liberar ticket',
      long_name: 'Solicitud de liberación de tickets',
      code: 'TICKET_RELEASE_LT30',
      emoji: '🔓',
      is_active: true,
    },
    {
      short_name: 'Colocar en proceso',
      long_name: 'Solicitud para colocar un ticket en proceso',
      code: 'TICKET_IN_PROCESS',
      emoji: '⏳',
      is_active: true,
    },
    // {
    //   short_name: 'Desbloquear >30d',
    //   long_name:
    //     'Solicitud de desbloqueo de tickets con antigüedad mayor a 30 días',
    //   code: 'TICKET_UNLOCK_GT30',
    //   emoji: '🗝️',
    //   is_active: true,
    // },
    // {
    //   short_name: 'Nota crédito',
    //   long_name: 'Solicitud para realizar nota de crédito',
    //   code: 'CREDIT_NOTE_CREATE',
    //   emoji: '🧾',
    //   is_active: true,
    // },
    // {
    //   short_name: 'Revertir nota crédito',
    //   long_name: 'Solicitud para reversión de nota de crédito',
    //   code: 'CREDIT_NOTE_REVERT',
    //   emoji: '↩️',
    //   is_active: true,
    // },
    // {
    //   short_name: 'Problema usuario',
    //   long_name: 'Problemas relacionados con usuario o acceso',
    //   code: 'USER_ISSUE',
    //   emoji: '👥',
    //   is_active: true,
    // },
    {
      short_name: 'Cambio responsable',
      long_name: 'Solicitud de cambio de responsable de atención de ticket',
      code: 'TICKET_REASSIGN',
      emoji: '🔄',
      is_active: true,
    },
    {
      short_name: 'Problema sistema',
      long_name: 'Incidencias o fallas del sistema',
      code: 'SYSTEM_ISSUE',
      emoji: '💻',
      is_active: true,
    },
    {
      short_name: 'Problema firma',
      long_name: 'Problemas relacionados con firma digital',
      code: 'SIGNATURE_ISSUE',
      emoji: '✍️',
      is_active: true,
    },
    {
      short_name: 'Nuevo usuario',
      long_name: 'Solicitud de creación de usuario en el sistema',
      code: 'USR_CREATE',
      emoji: '👤',
      is_active: true,
    },
    {
      short_name: 'Otros',
      long_name: 'Otras solicitudes no categorizadas',
      code: 'OTHER',
      emoji: '📦',
      is_active: true,
    },
  ]);

  console.log('RequestType seed completado');
}
