<script lang="ts">
	import { onMount } from "svelte";

    let motion_detected = "Motion not allowed"
    let pressed = 'not pressed'
    let name = Math.random().toString(36).substring(7)
    let navigatorSupported = false
    let error = ""
    let tested_motion = false
    onMount(() => {
        if (navigator.geolocation) {
            navigatorSupported = true
        }
        window.addEventListener('click', () => {            
            if(!tested_motion) requestAccessAsync()
        })
    })


    const requestAccessAsync = async (): Promise<boolean> => {
        if (!DeviceOrientationEvent) {
            error = 'Device orientation event is not supported by your browser';
            return false;
        }

        if ((DeviceOrientationEvent as any).requestPermission && typeof (DeviceMotionEvent as any).requestPermission === 'function' ) {
        let permission: PermissionState;
        try {
            console.log("Requesting permission...");
            permission = await (DeviceOrientationEvent as any).requestPermission();
        } catch (err: any) {
            error = err.message;
            return false;
        }
        if (permission !== 'granted') {
            error = 'Request to access the device orientation was rejected';
            return false;
        }
        }

        window.addEventListener('devicemotion', handleMotion);

        return true;
    };

    function handleKey(e: KeyboardEvent){
        if(e.code === 'Space'){
            handle()
        }
    }
    async function handle(){
        console.log("Getting location...");
        
        pressed = `pressed by ${name}`
        navigator.geolocation.getCurrentPosition((pos) => {
            console.log(pos)
            sendBump(pos.coords)
        }, (err) => {
            console.log(err)
            pressed = 'not pressed'
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
        pressed = 'Bumped! Waiting for match...'
        await timeout(1000)
        pressed = 'Almost there...'
        const match_response = await fetch('/api/match?' + new URLSearchParams({
            name: name,
            location: JSON.stringify(data.location),
            requestTime: json["RequestTime"]
        }))
        const match = await match_response.json()
        if(match["Status"] !== "OK"){
            pressed = 'Could not find match. Try again...'
            return
        }
        pressed = 'Matched with ' + match["match"]["user"]
        window.navigator.vibrate([200, 100, 200]);

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
<h1>Bump clone</h1>
<input type="text" bind:value={name} />
<button on:click={handle}>Send "bump"</button>
<p>Or press spacebar</p>
<p>{pressed}</p>
<p>Motion {motion_detected}</p>
<p>{error}</p>
{#if navigatorSupported}
    <p>Geolocation is supported</p>
{:else}
    <p>Geolocation is not supported</p>
{/if}
