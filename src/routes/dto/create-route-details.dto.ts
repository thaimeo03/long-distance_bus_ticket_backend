import { CreateRouteStopDto } from 'src/route-stops/dto/create-route-stop.dto'
import { CreateRouteDto } from './create-route.dto'
import { ArrayNotEmpty, ValidateNested } from 'class-validator'

export class CreateRouteDetailsDto extends CreateRouteDto {
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  routeStops: Omit<CreateRouteStopDto, 'routeId'>[]
}
