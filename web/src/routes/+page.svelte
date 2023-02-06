<script lang="ts">
	import { onMount } from "svelte";
    import PocketBase from 'pocketbase';
    import { env } from '$env/dynamic/public';
	import GeolocationPrompt from "../libs/GeolocationPrompt.svelte";
    import { PermissionsStore } from "../utils/stores";
	import MotionPrompt from "../libs/MotionPrompt.svelte";
    const pocketbaseURL = env["PUBLIC_POCKETBASE_URL"] ? env.PUBLIC_POCKETBASE_URL : ""
    const pb = new PocketBase(pocketbaseURL);
    let motion_detected = "Motion not allowed"
    let pressed = 'not pressed'
    let name = Math.random().toString(36).substring(7)
    let error = ""
    let supported_device = true
    let permissions = {
        geolocation: false,
        motion: false
    }
    PermissionsStore.subscribe((value) => {
        permissions = value
    })
    onMount(() => {
        supported_device = navigator.geolocation ? true : false; //only navigator.geolocation is gives warning
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
            if (result.state === 'granted') {
                PermissionsStore.update((value) => {
                    value.geolocation = true
                    return value
                })
                console.log("Geolocation already granted");
            } else if (result.state === 'denied') {
                console.log("Geolocation denied");
            } else if (result.state === 'prompt') {
                console.log("Geolocation prompt");
            }
        });
    })

    function handleKey(e: KeyboardEvent){
        if(e.code === 'Space'){
            handle()
        }
    }
    async function handle(){
        console.log("Getting location...");
        
        pressed = "Getting location..."
        navigator.geolocation.getCurrentPosition((pos) => {
            console.log(pos)
            sendBump(pos.coords)
        }, (err) => {
            console.log(err)
            pressed = 'Geolocation error. Try again... ' + err.message
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        })
    }
    function timeout(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function sendBump(coords:GeolocationCoordinates) {
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
            }}
        
        const response = await fetch('/api/bump', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'content-type': 'application/json'
            }
        });
        const json = await response.json()
        if(json["Status"] !== "OK"){
            pressed = 'Could not bump. Try again...'
            return
        }
        // const created = json["RequestTime"]
        const recordId = json["RecordID"]
        pressed = 'Bumped! Waiting for match...'
        console.log("Setting up listener...", recordId);
        let foundMatch = false
        let unsub = await pb.collection('bumps').subscribe(recordId, function (e) {
            pressed = 'Matched with ' + e.record.matched_with
            console.log(e.record);
            foundMatch = true
        });

        await timeout(10*1000)
        if(!foundMatch) {
            const match_response = await fetch('/api/match?' + new URLSearchParams({
                recordId: recordId
            }))
            const match = await match_response.json()
            if(match["Status"] !== "OK" || match["matched_with"] === ""){
                pressed = 'Could not find match. Try again...'
                return
            }
            pressed = 'Matched with ' + match["matched_with"]
        }
        unsub()
        console.log("Unsubscribed");
    }


    let max = 0
    function handleMotion(e: DeviceMotionEvent){
        
        if(!e.acceleration || e.acceleration.x === null || e.acceleration.y === null || e.acceleration.z === null){
            return
        }
        if(e.acceleration?.x > 10 || e.acceleration?.x < -10){
            console.log("Bump!");
            pressed = "Bump!"
            handle()
        }
        motion_detected = Math.round(e.acceleration.x) + " " + Math.round(e.acceleration.y) + " " +Math.round(e.acceleration.z)
        
    }

</script>
<svelte:window on:keydown={handleKey}/>
{#if supported_device}
    {#if !permissions.geolocation}
        <GeolocationPrompt />
    {:else if !permissions.motion}
        <MotionPrompt handleMotion={handleMotion}/>
    {/if}
    <h1>Bump clone</h1>
    <input type="text" bind:value={name} />
    <button on:click={handle}>Send "bump"</button>
    <p>Or press spacebar</p>
    <p>{pressed}</p>
    <p>Motion {motion_detected}</p>
    <p>{error}</p>
{:else}
    <p>Your device is not supported device</p>
{/if}
