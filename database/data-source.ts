import { DataSource, DataSourceOptions } from 'typeorm'
import { config } from 'dotenv'

config({ path: ['.env.local', '.env'] })

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  url: 'postgres://default:u4fR1otxeHAy@ep-aged-mud-a1oevbq5-pooler.ap-southeast-1.aws.neon.tech:5432/verceldb?sslmode=require',
  database: process.env.DB_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/database/migrations/*{.ts,.js}'],
  synchronize: false
}

const dataSource = new DataSource(dataSourceOptions)
export default dataSource
