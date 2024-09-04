import { DataSource, DataSourceOptions } from 'typeorm'
import { config } from 'dotenv'

config({ path: ['.env.local', '.env'] })

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  url: process.env.DB_URL,
  database: process.env.DB_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/database/migrations/*{.ts,.js}'],
  synchronize: false
}

const dataSource = new DataSource(dataSourceOptions)
export default dataSource
