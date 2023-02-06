import { Inngest } from "inngest";

export type GeoLocation = {
	lat: number;
	lon: number;
	accuracy?: number;
	attitude?: number;
	speed?: number;
	altitudeAccuracy?: number;
	heading?: number;
};

export type BumpCreated = {
	name: 'bump.created';
	data: {
		user: string;
		requestTime: string;
		location: GeoLocation;
		recordId: string;
	};
};

type Events = {
	'bump.created': BumpCreated;
};

export const inngest = new Inngest<Events>({ name: "My app" });
