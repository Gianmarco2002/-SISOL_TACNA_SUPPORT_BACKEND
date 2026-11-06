import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class ChangeOwnPassword {
  @IsOptional()
  @IsString()
  current_password?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  new_password!: string;
}
