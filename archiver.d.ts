declare module "archiver" {
  import { Transform } from "node:stream";

  // Options configuration for glob matching
  export interface GlobOptions {
    cwd?: string;
    ignore?: string | string[];
    dot?: boolean;
    debug?: boolean;
    [key: string]: any; 
  }

  // 1. Core base class
  export class Archiver extends Transform {
    constructor(options?: any);
    _format: string;
    _module: any;
    _supportsDirectory: boolean;
    _supportsSymlink: boolean;
    _modulePipe(): void;
    
    // Core utility methods from archiver base
    append(source: any, data: any): this;
    directory(dirpath: string, destpath: string | boolean, data?: any): this;
    file(filepath: string, data: any): this;
    finalize(): Promise<void>;

    // New additions to fix your errors
    glob(pattern: string, options?: GlobOptions, data?: any): this;
    pointer(): number;
  }

  // 2. Specific custom Archive wrappers from archiver/index.js
  export class ZipArchive extends Archiver {}
  export class TarArchive extends Archiver {}
  export class JsonArchive extends Archiver {}

  // 3. Default factory function export
  export function create(format: string, options?: any): Archiver;
  export default create;
}
