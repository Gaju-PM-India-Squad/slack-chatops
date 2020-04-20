declare module "sigsci" {
    export default class SigSci {
        constructor(path: { path: string });

        public express(): string | RegExp | Array<string | RegExp>;
    }
}