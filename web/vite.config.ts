import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import fs from "fs" // 👈 import the 'fs' module
import dotenv from "dotenv"
dotenv.config()
const tlsCert = process.env["TLS_CERT"] ? process.env.TLS_CERT : ""
const tlsKey = process.env["TLS_KEY"] ? process.env.TLS_KEY : ""

const config: UserConfig = {
	plugins: [sveltekit()],
	server: {
		https: {
			key: fs.readFileSync(tlsKey),
			cert: fs.readFileSync(tlsCert),
		}
	}
};

export default config;
