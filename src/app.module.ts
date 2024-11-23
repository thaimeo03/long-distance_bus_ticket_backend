import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { dataSourceOptions } from '../database/data-source'
import { SchedulesModule } from './schedules/schedules.module'
import { DataService } from 'database/fake-data'
import { Route } from './routes/entities/route.entity'
import { RouteStop } from './route-stops/entities/route-stop.entity'
import { Schedule } from './schedules/entities/schedule.entity'
import { BusCompany } from './bus-companies/entities/bus-company.entity'
import { Bus } from './buses/entities/bus.entity'
import { Seat } from './seats/entities/seat.entity'
import { Price } from './prices/entities/price.entity'
import { RouteStopsModule } from './route-stops/route-stops.module'
import { BookingsModule } from './bookings/bookings.module'
import { UsersModule } from './users/users.module'
import { BusesModule } from './buses/buses.module'
import { SeatsModule } from './seats/seats.module'
import { PaymentsModule } from './payments/payments.module'
import { ScheduleModule } from '@nestjs/schedule'
import { PricesModule } from './prices/prices.module'
import { MailsModule } from './mails/mails.module'
import { AuthModule } from './auth/auth.module'
import { AdminModule } from './admin/admin.module'
import { BusCompaniesModule } from './bus-companies/bus-companies.module';
import { RoutesModule } from './routes/routes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env']
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Route, RouteStop, Schedule, BusCompany, Bus, Seat, Price]),
    SchedulesModule,
    RouteStopsModule,
    BookingsModule,
    UsersModule,
    BusesModule,
    SeatsModule,
    PaymentsModule,
    PricesModule,
    MailsModule,
    AuthModule,
    AdminModule,
    BusCompaniesModule,
    RoutesModule
  ],
  controllers: [AppController],
  providers: [AppService, DataService]
})
export class AppModule {}
