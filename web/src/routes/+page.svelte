<script lang="ts">
	import { onMount } from 'svelte';
	import PocketBase from 'pocketbase';
	import { env } from '$env/dynamic/public';
	import GeolocationPrompt from '../libs/GeolocationPrompt.svelte';
	import { PermissionsStore } from '../utils/stores';
	import MotionPrompt from '../libs/MotionPrompt.svelte';
	const pocketbaseURL = env['PUBLIC_POCKETBASE_URL'] ? env.PUBLIC_POCKETBASE_URL : '';
	const pb = new PocketBase(pocketbaseURL);
	let motion_detected = 'Motion not allowed';
	let pressed = 'not pressed';
	let name = Math.random().toString(36).substring(7);
	let error = '';
	let supported_device = true;
	let permissions = {
		geolocation: false,
		motion: false
	};
	let checks = 0;
	let location: GeolocationCoordinates;
	PermissionsStore.subscribe((value) => {
		permissions = value;
	});
	onMount(() => {
		supported_device = navigator.geolocation ? true : false; //only navigator.geolocation is gives warning
		navigator.permissions.query({ name: 'geolocation' }).then((result) => {
			if (result.state === 'granted') {
				PermissionsStore.update((value) => {
					value.geolocation = true;
					return value;
				});
			} else if (result.state === 'denied') {
				console.log('Geolocation denied');
			} else if (result.state === 'prompt') {
				console.log('Geolocation prompt');
			}
		});

		updateLoc();
	});

	function updateLoc() {
		checks++;
		if (!permissions.geolocation) {
			setTimeout(() => {
				updateLoc();
			}, 1000);
		} else {
            console.log("Fetching location...");
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					location = pos.coords;
                    console.log("Success!");

					setTimeout(() => {
						updateLoc();
					}, 5000);
				},
				(err) => {
					error = err.message;
                    console.log("Trying low accuracy...");
                    
					setTimeout(() => {
						navigator.geolocation.getCurrentPosition(
							(pos) => {
								location = pos.coords;
                                console.log("Low accuracy: Success!");
                                updateLoc();
							},
							(err) => {
								error = err.message;
                                console.log("Failed again... aborting.");
                                updateLoc();
							},
							{
								enableHighAccuracy: false,
								timeout: 4000,
								maximumAge: 0
							}
						);
                            
					}, 5000);
				},
				{
					enableHighAccuracy: true,
					timeout: 5000,
					maximumAge: 0
				}
			);
		}
	}

	function handleKey(e: KeyboardEvent) {
		if (e.code === 'Space') {
			handle();
		}
	}
	async function handle() {
		console.log('Getting location...');

		pressed = 'Getting location...';
		if(!location) {
            console.log("No location found. Trying again...");
            updateLoc();
            handle();
            return;
        }
        sendBump(location);
	}
	function timeout(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async function sendBump(coords: GeolocationCoordinates) {
		const data = {
			name: name,
			location: {
				lat: coords.latitude,
				lon: coords.longitude,
				accuracy: coords.accuracy,
				altitude: coords.altitude,
				altitudeAccuracy: coords.altitudeAccuracy,
				heading: coords.heading,
				speed: coords.speed
			}
		};

		const response = await fetch('/api/bump', {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'content-type': 'application/json'
			}
		});
		const json = await response.json();
		if (json['Status'] !== 'OK') {
			pressed = 'Could not bump. Try again...';
			return;
		}
		// const created = json["RequestTime"]
		const recordId = json['RecordID'];
		pressed = 'Bumped! Waiting for match...';
		console.log('Setting up listener...', recordId);
		let foundMatch = false;
		let unsub = await pb.collection('bumps').subscribe(recordId, function (e) {
			pressed = 'Matched with ' + e.record.matched_with;
			console.log(e.record);
			foundMatch = true;
		});

		await timeout(10 * 1000);
		if (!foundMatch) {
			const match_response = await fetch(
				'/api/match?' +
					new URLSearchParams({
						recordId: recordId
					})
			);
			const match = await match_response.json();
			if (match['Status'] !== 'OK' || match['matched_with'] === '') {
				pressed = 'Could not find match. Try again...';
				return;
			}
			pressed = 'Matched with ' + match['matched_with'];
		}
		unsub();
		console.log('Unsubscribed');
	}

	let max = 0;
	function handleMotion(e: DeviceMotionEvent) {
		if (
			!e.acceleration ||
			e.acceleration.x === null ||
			e.acceleration.y === null ||
			e.acceleration.z === null
		) {
			return;
		}
		if (e.acceleration?.x > 10 || e.acceleration?.x < -10) {
			console.log('Bump!');
			pressed = 'Bump!';
			handle();
		}
		motion_detected =
			Math.round(e.acceleration.x) +
			' ' +
			Math.round(e.acceleration.y) +
			' ' +
			Math.round(e.acceleration.z);
	}
</script>

<svelte:window on:keydown={handleKey} />
{#if supported_device}
	{#if !permissions.geolocation}
		<GeolocationPrompt />
	{:else if !permissions.motion}
		<MotionPrompt {handleMotion} />
	{/if}
	<h1>Bump clone</h1>
	{#if location}
		<input type="text" bind:value={name} />
		<button on:click={handle}>Send "bump"</button>
		<p>Or press spacebar</p>
		<p>{pressed}</p>
	{/if}
	<p>Motion {motion_detected}</p>
	<p>Location {location?.latitude} {location?.longitude}</p>
	<p>{error}</p>
	{checks}
{:else}
	<p>Your device is not supported device</p>
{/if}
