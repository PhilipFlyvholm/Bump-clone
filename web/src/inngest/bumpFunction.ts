import {inngest} from "./client.js";
import type { GeoLocation } from './client';
import PocketBase from 'pocketbase';
import dotenv from "dotenv"
import { calcDistanceInMeters } from "../utils/haversine.js";
dotenv.config()

const pocketbaseURL = process.env["PUBLIC_POCKETBASE_URL"] ? process.env.PUBLIC_POCKETBASE_URL : ""
const adminEmail = process.env["ADMIN_EMAIL"] ? process.env.ADMIN_EMAIL : ""
const adminPassword = process.env["ADMIN_PASSWORD"] ? process.env.ADMIN_PASSWORD : ""
const pb = new PocketBase(pocketbaseURL); //http://127.0.0.1:8090
await pb.admins.authWithPassword(adminEmail, adminPassword);
pb.autoCancellation(false);


export default inngest.createFunction(
  "Find match for bump",
  "bump.created",
  async ({event}) => {
    const { user, requestTime, location, recordId } = event.data;
    const match = await getMatch(user, requestTime, location);
    if (match) {
      if(match.matched_with === null || match.matched_with === undefined || match.matched_with === ""){
        pb.collection('bumps').update(match.id, {matched_with: user});
        pb.collection('bumps').update(recordId, {matched_with: match.user});
        return {success: true}
      }
    }else{
      console.log('No match found');
    }
    return {success: false}
  },
)

async function getMatch(user:string, requestTime:string, loc:GeoLocation){
  const date = new Date(new Date(requestTime).getTime() - 1000 * 5);
  const filterQuery = `user != '${user}' && created >= '${getUTCDateString(date)}'`;
    let records;
    try{
        records = await pb.collection('bumps').getFullList(200 /* batch size */, {
            filter: filterQuery,
            sort: '-created'
        });
    }catch(error){
        console.log(error);
        return null;
    }
	
	if (!records) {
		return null;
	}
	//VERY NAIVE IMPLEMENTATION
	records.forEach((r) => {
		r.distance = calcDistanceInMeters(loc['lat'], r.location.lat, loc['lon'], r.location.lon);
	});
	const matches = records.sort((a, b) => a.distance - b.distance);
	if (!matches || matches.length === 0) {
		console.log('No matches');
		return null;
	}
	const match = matches[0];
	console.log(match.distance);
	
	if (match.distance > .5) {
		return null;
	}
  return match;
}

function getUTCDateString(date: Date) {
	const month = date.getUTCMonth() + 1 < 10 ? `0${date.getUTCMonth() + 1}` : date.getUTCMonth() + 1;
	const day = date.getUTCDate() < 10 ? `0${date.getUTCDate()}` : date.getUTCDate();
	const hours = date.getUTCHours() < 10 ? `0${date.getUTCHours()}` : date.getUTCHours();
	const minutes = date.getUTCMinutes() < 10 ? `0${date.getUTCMinutes()}` : date.getUTCMinutes();
	const seconds = date.getUTCSeconds() < 10 ? `0${date.getUTCSeconds()}` : date.getUTCSeconds();
	return `${date.getUTCFullYear()}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
