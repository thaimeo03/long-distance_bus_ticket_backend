import { DataSource, DataSourceOptions } from 'typeorm'
import 'dotenv/config'

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres', 
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: '',
    database: process.env.DB_NAME,
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/database/migrations/*{.ts,.js}'], 
    synchronize: true,
}

const dataSource = new DataSource(dataSourceOptions)
export default dataSource