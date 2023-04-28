import { PropertyType, UserType } from ".prisma/client";
import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Body,
  UseGuards,
  ForbiddenException
} from "@nestjs/common";
import { User, UserInfo } from "src/user/decorators/user.decorator";
import {
  CreateHomeDto,
  HomeResponseDto,
  InquireDto,
  UpdateHomeDto
} from "./dto/home.dto";
import { HomeService } from "./home.service";
import { AuthGuard } from "src/guards/auth.guard";
import { Roles } from "src/decorators/roles.decorator";

@Controller("home")
export class HomeController {

  constructor(private readonly homeService: HomeService) {
  }

  @Get()
  getHomes(
    @Query("city") city?: string,
    @Query("minPrice") minPrice?: string,
    @Query("maxPrice") maxPrice?: string,
    @Query("propertyType") propertyType?: PropertyType
  ): Promise<HomeResponseDto[]> {

    const price =
      minPrice || maxPrice
        ? {
          ...(minPrice && { gte: parseFloat(minPrice) }),
          ...(maxPrice && { lte: parseFloat(maxPrice) })
        }
        : undefined;

    const filters = {
      ...(city && { city }),
      ...(price && { price }),
      ...(propertyType && { propertyType })
    };

    // {
    //   city: 'Oslo',
    //     price: { gte: 10000, lte: 60000 },
    //   propertyType: 'CONDO'
    // }

    return this.homeService.getHomes(filters);
  }

  @Get(":id")
  getHome(@Param("id", ParseIntPipe) id: number) {
    return this.homeService.getHomeById(id);
  }

  @Roles(UserType.REALTOR)
  // @UseGuards(AuthGuard)
  @Post()
  createHome(@Body() body: CreateHomeDto, @User() user: UserInfo) {
    return this.homeService.createHome(body, user.id);
  }

  @Roles(UserType.REALTOR)
  // @UseGuards(AuthGuard)
  @Put(":id")
  async updateHome(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateHomeDto,
    @User() user: UserInfo
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id);

    if (realtor.id !== user.id) {
      throw new ForbiddenException();
    }

    return this.homeService.updateHomeById(id, body);
  }

  @Roles(UserType.REALTOR)
  // @UseGuards(AuthGuard)
  @Delete(":id")
  async deleteHome(
    @Param("id", ParseIntPipe) id: number,
    @User() user: UserInfo
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id);

    if (realtor.id !== user.id) {
      throw new ForbiddenException();
    }
    return this.homeService.deleteHomeById(id);
  }

  // Buyer sends message to Realtor
  @Roles(UserType.BUYER)
  // @UseGuards(AuthGuard)
  @Post("/:id/inquire")
  inquire(
    @Param("id", ParseIntPipe) homeId: number,
    @User() user: UserInfo,
    @Body() { message }: InquireDto
  ) {
    return this.homeService.inquire(user, homeId, message);
  }

  // Realtor gets all messages
  @Roles(UserType.REALTOR)
  // @UseGuards(AuthGuard)
  @Get("/:id/messages")
  async getHomeMessages(
    @Param("id", ParseIntPipe) id: number,
    @User() user: UserInfo
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id);

    if (realtor.id !== user.id) {
      throw new ForbiddenException();
    }

    return this.homeService.getMessagesByHome(id);
  }
}



