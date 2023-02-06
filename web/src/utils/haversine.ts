const R = 6371000; // radius of Earth in meters (mean radius = 6,371km)
const pi = Math.PI;

function degrees_to_radians(degrees: number)
{
  return degrees * (pi/180);
}

// This function calculates the distance between two points (given the latitude/longitude of those points).
// AKA Haversine formula
export function calcDistanceInMeters(lat1: number, lat2: number, lon1: number, lon2: number): number {
	const phi_1 = degrees_to_radians(lat1);
    const phi_2 = degrees_to_radians(lat2);
    const delta_phi = degrees_to_radians(lat2-lat1);
    const delta_lambda = degrees_to_radians(lon2-lon1);

    const a = Math.sin(delta_phi / 2.0) ** 2 + Math.cos(phi_1) * Math.cos(phi_2) * Math.sin(delta_lambda / 2.0) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const meters = R * c
    return meters
    /*// distance between latitudes
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
	return (r * c)*1000;*/
}