import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUser } from './dto/createUser.dto';
import { UpdateUser } from './dto/updateUser.dto';
import { UpdateUserPassword } from './dto/updateUserPassword.dto';
import { LoginUser } from './dto/loginUser.dto';
import { Public } from 'src/auth/public.decorator';

@Controller('user')
export class UserController {
  private readonly userService: UserService;

  constructor(UserService: UserService) {
    this.userService = UserService;
  }

  @Get('/')
  async getAllUser() {
    return await this.userService.getAllUser();
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
  async resetUserPassword(@Param('id') id: number) {
    const updateUser = await this.userService.resetPassword(Number(id));
    if (!updateUser) {
      throw new NotFoundException('No existe el usuario');
    }
    return updateUser;
  }

  @Delete('/:id')
  async deleteUser(@Param('id') id: number) {
    const deleteUser = await this.userService.deleteUser(id);
    if (!deleteUser) {
      throw new NotFoundException('No existe el usuario');
    }
    return deleteUser;
  }
}
