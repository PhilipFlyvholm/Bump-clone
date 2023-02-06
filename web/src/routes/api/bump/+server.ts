import { json } from '@sveltejs/kit';
import { inngest } from "../../../inngest/client.js";

import PocketBase from 'pocketbase';

const pocketbaseURL = process.env["PUBLIC_POCKETBASE_URL"] ? process.env.PUBLIC_POCKETBASE_URL : ""
const adminEmail = process.env["ADMIN_EMAIL"] ? process.env.ADMIN_EMAIL : ""
const adminPassword = process.env["ADMIN_PASSWORD"] ? process.env.ADMIN_PASSWORD : ""
const pb = new PocketBase(pocketbaseURL);
await pb.admins.authWithPassword(adminEmail, adminPassword);

export async function POST({ request }: { request: Request}) {
  const { name, location } = await request.json();
  const data = {
    "user": name,
    "location": location
  };
  try{
    const record = await pb.collection('bumps').create(data, {'$cancelKey': `/api/bump/${name}`});
    inngest.setEventKey('dummp_key');
    await inngest.send({
      // The event name
      name: "bump.created",
      eventKey: 'dummp_key',
      // The event's data
      data: {
        user: name,
        requestTime: record.created,
        location: location,
        recordId: record.id
      }
    });
    return json({Status: "OK", RequestTime: record.created, RecordID: record.id});
  }catch(err){
    console.log(err);  
    return json({Status: "Error"});
  }
}