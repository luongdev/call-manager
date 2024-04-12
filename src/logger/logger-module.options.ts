import { ModuleMetadata } from '@nestjs/common';
import { LoggerOptions } from 'winston';
export interface LoggerModuleOptionsAsync extends LoggerOptions, Pick<ModuleMetadata, 'imports'> {}
export const LOGGER_MODULES_OPTIONS_ASYNC = Symbol('LoggerModuleOptionsAsync');
