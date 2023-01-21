import {inngest} from "./client.js";
import type { GeoLocation } from './client';
import PocketBase from 'pocketbase';
import dotenv from "dotenv"
dotenv.config()

const pocketbaseURL = process.env["POCKETBASE_URL"] ? process.env.POCKETBASE_URL : ""
const adminEmail = process.env["ADMIN_EMAIL"] ? process.env.ADMIN_EMAIL : ""
const adminPassword = process.env["ADMIN_PASSWORD"] ? process.env.ADMIN_PASSWORD : ""
console.log(pocketbaseURL);

const pb = new PocketBase("http://127.0.0.1:8090"); //http://127.0.0.1:8090
await pb.admins.authWithPassword(adminEmail, adminPassword);

const r = 6371; // radius of Earth (KM)
const p = Math.PI / 180;

export default inngest.createFunction(
  "Find match for bump",
  "bump.created",
  async ({event}) => {
    const { user, requestTime, location, recordId } = event.data;
    console.log(user, requestTime, location, recordId);
    const match = await getMatch(user, requestTime, location);
    if (match) {
      console.log('Match found', match);
      if(match.matched_with === null){
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
		r.distance = calcDistance(loc['lat'], r.location.lat, loc['lon'], r.location.lon);
	});
	const matches = records.sort((a, b) => a.distance - b.distance);
	if (!matches || matches.length === 0) {
		console.log('No matches');
		return null;
	}
	const match = matches[0];
	if (match.distance > 5) {
		return null;
	}
  return match;
}

// This function calculates the distance between two points (given the latitude/longitude of those points).
// AKA Haversine formula
function calcDistance(lat1: number, lat2: number, lon1: number, lon2: number): number {
	// distance between latitudes
	// and longitudes
	const dLat = ((lat2 - lat1) * p) / 180.0;
	const dLon = ((lon2 - lon1) * p) / 180.0;

	// convert to radiansa
	lat1 = (lat1 * p) / 180.0;
	lat2 = (lat2 * p) / 180.0;

	// apply formulae
	const a =
		Math.pow(Math.sin(dLat / 2), 2) +
		Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.asin(Math.sqrt(a));
	return (r * c)*1000;
}

function getUTCDateString(date: Date) {
	const month = date.getUTCMonth() + 1 < 10 ? `0${date.getUTCMonth() + 1}` : date.getUTCMonth() + 1;
	const day = date.getUTCDate() < 10 ? `0${date.getUTCDate()}` : date.getUTCDate();
	const hours = date.getUTCHours() < 10 ? `0${date.getUTCHours()}` : date.getUTCHours();
	const minutes = date.getUTCMinutes() < 10 ? `0${date.getUTCMinutes()}` : date.getUTCMinutes();
	const seconds = date.getUTCSeconds() < 10 ? `0${date.getUTCSeconds()}` : date.getUTCSeconds();
	return `${date.getUTCFullYear()}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
