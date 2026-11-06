import { VoucherActionType } from 'src/voucher_action_type/voucher_action_type.entity';
import { DataSource } from 'typeorm';

export async function seedVoucherActionType(dataSource: DataSource) {
  const repository = dataSource.getRepository(VoucherActionType);

  const count = await repository.count();

  if (count > 0) {
    // Acciones agregadas después de la carga inicial
    const enProceso = await repository.findOneBy({ code: 'EN_PROC' });
    if (!enProceso) {
      await repository.save({
        name: 'Colocar ticket en proceso',
        code: 'EN_PROC',
        is_active: true,
      });
      console.log('VoucherActionType EN_PROC agregado');
    }
    console.log('VoucherActionType ya existe');
    return;
  }

  await repository.save([
    {
      name: 'Liberación de ticket menor a 30 días',
      code: 'LIB_30',
      is_active: true,
    },
    {
      name: 'Colocar ticket en proceso',
      code: 'EN_PROC',
      is_active: true,
    },
    {
      name: 'Desbloqueo de ticket mayor a 30 días',
      code: 'DESB_30',
      is_active: true,
    },
    {
      name: 'Generación de nota de crédito',
      code: 'NOTA_CRED',
      is_active: true,
    },
    {
      name: 'Reversión de nota de crédito',
      code: 'REV_NOTA_CRED',
      is_active: true,
    },
  ]);

  console.log('VoucherActionType seed completado');
}
