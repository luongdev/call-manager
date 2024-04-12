import { DatabaseOptions } from '@database/database.options';

export interface DatabaseConfigService<T extends DatabaseOptions> {
    createOptions(): T;
}
