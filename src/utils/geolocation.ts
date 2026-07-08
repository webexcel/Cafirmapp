import { Platform, PermissionsAndroid } from "react-native";
import Geolocation from "react-native-geolocation-service";

export interface LocationCoords {
	latitude: number;
	longitude: number;
}

export type WorkMode = "office" | "remote";

const OFFICE_LATITUDE = 13.141954;
const OFFICE_LONGITUDE = 80.249285;
const OFFICE_RADIUS_METERS = 50;

async function requestAndroidPermission(): Promise<boolean> {
	const granted = await PermissionsAndroid.request(
		PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
		{
			title: "Location Permission",
			message: "This app needs access to your location for attendance tracking.",
			buttonPositive: "OK",
		},
	);
	return granted === PermissionsAndroid.RESULTS.GRANTED;
}

function getDistanceInMeters(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number {
	const toRad = (deg: number) => (deg * Math.PI) / 180;
	const R = 6371000;
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

export function isWithinOffice(coords: LocationCoords): boolean {
	const distance = getDistanceInMeters(
		coords.latitude,
		coords.longitude,
		OFFICE_LATITUDE,
		OFFICE_LONGITUDE,
	);
	return distance <= OFFICE_RADIUS_METERS;
}

// Classify a login/logout for the "log, don't block" policy: within the office
// geofence is "office", anywhere else (or an unavailable location) is "remote".
export function getWorkMode(coords: LocationCoords | null): WorkMode {
	return coords && isWithinOffice(coords) ? "office" : "remote";
}

export async function getCurrentLocation(): Promise<LocationCoords | null> {
	if (Platform.OS === "android") {
		const hasPermission = await requestAndroidPermission();
		if (!hasPermission) {
			return null;
		}
	}

	return new Promise((resolve) => {
		Geolocation.getCurrentPosition(
			(position) => {
				resolve({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
				});
			},
			() => {
				resolve(null);
			},
			{
				enableHighAccuracy: true,
				timeout: 15000,
				maximumAge: 10000,
			},
		);
	});
}
