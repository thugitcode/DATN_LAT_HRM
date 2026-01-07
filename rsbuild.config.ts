import { tanstackRouter } from '@tanstack/router-plugin/rspack';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  tools: {
    rspack: {
      plugins: [
        tanstackRouter({
          target: 'react',
          autoCodeSplitting: true,
        }),
      ],
    },
  },
  output: {
    distPath: {
      root: 'build',
    },
  },
  server: {
    port: 4000,
  },
  dev: {
    progressBar: true,
  },
  html: {
    template: './public/index.html',
  },
});
