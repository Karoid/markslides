declare module '@kazumatu981/markdown-it-kroki' {
  import { PluginSimple } from 'markdown-it';

  interface KrokiOptions {
    server?: string;
    format?: string;
    theme?: string;
    [key: string]: any;
  }

  const markdownItKroki: PluginSimple<KrokiOptions>;
  export = markdownItKroki;
}
