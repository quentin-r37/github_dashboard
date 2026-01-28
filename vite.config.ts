import fs from 'node:fs';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	server: {
		https: {
			key: fs.readFileSync('certs/key.pem'),
			cert: fs.readFileSync('certs/cert.pem')
		}
	}
});
