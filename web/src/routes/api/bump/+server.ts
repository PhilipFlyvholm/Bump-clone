import { json } from '@sveltejs/kit';
import PocketBase from 'pocketbase';

const adminEmail = process.env["ADMIN_EMAIL"] ? process.env.ADMIN_EMAIL : ""
const adminPassword = process.env["ADMIN_PASSWORD"] ? process.env.ADMIN_PASSWORD : ""
const pb = new PocketBase('http://127.0.0.1:8090');
await pb.admins.authWithPassword(adminEmail, adminPassword);

export async function POST({ request }: { request: Request}) {
  const { name, location } = await request.json();
  const data = {
    "user": name,
    "location": location
  };
  try{
    const record = await pb.collection('bumps').create(data, {'$cancelKey': `/api/bump/${name}`});
    return json({Status: "OK", RequestTime: record.created});
  }catch(err){
    console.log(err);  
    return json({Status: "Error"});
  }
}