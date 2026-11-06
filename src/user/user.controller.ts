import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUser } from './dto/createUser.dto';
import { UpdateUser } from './dto/updateUser.dto';
import { UpdateUserPassword } from './dto/updateUserPassword.dto';
import { LoginUser } from './dto/loginUser.dto';
import { SetActiveUser } from './dto/setActiveUser.dto';
import { Public } from 'src/auth/public.decorator';

function verificarAdmin(adminKey: string | undefined) {
  if (!adminKey || !process.env.ADMIN_KEY || adminKey !== process.env.ADMIN_KEY) {
    throw new UnauthorizedException('Acceso no autorizado');
  }
}

@Controller('user')
export class UserController {
  private readonly userService: UserService;

  constructor(UserService: UserService) {
    this.userService = UserService;
  }

  // Solo el panel admin puede listar a todos los usuarios
  @Get('/')
  async getAllUser(@Headers('x-admin-key') adminKey: string) {
    verificarAdmin(adminKey);
    return await this.userService.getAllUser();
  }

  @Get('/admin/all')
  async getAllUsersAdmin(@Headers('x-admin-key') adminKey: string) {
    verificarAdmin(adminKey);
    return await this.userService.getAllUsersAdmin();
  }

  @Patch('/admin/:id/reset')
  async resetPasswordAdmin(
    @Headers('x-admin-key') adminKey: string,
    @Param('id') id: string,
  ) {
    verificarAdmin(adminKey);
    return await this.userService.resetPasswordAdmin(Number(id));
  }

  @Patch('/admin/:id/active')
  async setActiveAdmin(
    @Headers('x-admin-key') adminKey: string,
    @Param('id') id: string,
    @Body() body: SetActiveUser,
  ) {
    verificarAdmin(adminKey);
    return await this.userService.setActiveAdmin(Number(id), body.is_active);
  }

  @Delete('/admin/:id')
  async deleteUserAdmin(
    @Headers('x-admin-key') adminKey: string,
    @Param('id') id: string,
  ) {
    verificarAdmin(adminKey);
    return await this.userService.deleteUserAdmin(Number(id));
  }

  @Get('/verify-session')
  verifySession() {
    return {
      success: true,
    };
  }

  @Get('/:id')
  async getUserById(@Param('id') id: string) {
    const currentUser = await this.userService.getUserById(Number(id));
    if (!currentUser) {
      throw new NotFoundException('No existe el usuario');
    }
    return currentUser;
  }

  @Public()
  @Post('/')
  async createUser(@Body() body: CreateUser) {
    return await this.userService.createUser(body);
  }

  @Public()
  @Post('/login')
  async loginUser(@Body() body: LoginUser) {
    return await this.userService.login(body);
  }

  @Put('/')
  async updateUser(@Body() body: UpdateUser) {
    const updateUser = await this.userService.updateUser(body);
    if (!updateUser) {
      throw new NotFoundException('No existe el usuario');
    }
    return updateUser;
  }

  @Patch('/:id/password')
  async updateUserPassword(
    @Param('id') id: number,
    @Body() body: UpdateUserPassword,
  ) {
    const updateUser = await this.userService.updateUserPassword(
      Number(id),
      body,
    );
    if (!updateUser) {
      throw new NotFoundException('No existe el usuario');
    }
    return updateUser;
  }

  @Patch('/:id/reset')
  async resetUserPassword(
    @Headers('x-admin-key') adminKey: string,
    @Param('id') id: number,
  ) {
    verificarAdmin(adminKey);
    const updateUser = await this.userService.resetPassword(Number(id));
    if (!updateUser) {
      throw new NotFoundException('No existe el usuario');
    }
    return updateUser;
  }

  @Delete('/:id')
  async deleteUser(
    @Headers('x-admin-key') adminKey: string,
    @Param('id') id: number,
  ) {
    verificarAdmin(adminKey);
    const deleteUser = await this.userService.deleteUser(id);
    if (!deleteUser) {
      throw new NotFoundException('No existe el usuario');
    }
    return deleteUser;
  }
}
