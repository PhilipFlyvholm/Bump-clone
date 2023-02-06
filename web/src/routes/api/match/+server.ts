import { json } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import dotenv from "dotenv"
dotenv.config()

const pocketbaseURL = process.env["PUBLIC_POCKETBASE_URL"] ? process.env.PUBLIC_POCKETBASE_URL : ""
const adminEmail = process.env["ADMIN_EMAIL"] ? process.env.ADMIN_EMAIL : ""
const adminPassword = process.env["ADMIN_PASSWORD"] ? process.env.ADMIN_PASSWORD : ""
const pb = new PocketBase(pocketbaseURL);
await pb.admins.authWithPassword(adminEmail, adminPassword);

export async function GET({ url }: { url: URL }) {
	const recordId = url.searchParams.get('recordId');
	if (!recordId) {
		return json({ Status: 'Error' });
	}

    const record = await pb.collection('bumps').getOne(recordId);
	
	return new Response(JSON.stringify({ Status: 'OK', matched_with: record.matched_with }));
}
