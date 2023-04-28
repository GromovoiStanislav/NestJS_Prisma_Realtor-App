import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { PrismaModule } from "./prisma/prisma.module";
import { HomeModule } from "./home/home.module";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { UserInterceptor } from "./user/interceptors/user.interceptor";
import { AuthGuard } from "./guards/auth.guard";

@Module({
  imports: [UserModule, PrismaModule, HomeModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: UserInterceptor
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ]
})
export class AppModule {
}


