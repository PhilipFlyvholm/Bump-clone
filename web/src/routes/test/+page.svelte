<script lang="ts">
	import { onMount } from "svelte";
	import { spring } from 'svelte/motion';

    let motion_detected = "Motion not allowed"
    let tested_motion = false
    let error = ""
    let height:number, width:number = 0;
    onMount(() => {
        window.addEventListener('click', () => {            
            if(!tested_motion) requestAccessAsync()
            else nextValue()
        })
    })


    const requestAccessAsync = async (): Promise<boolean> => {
        tested_motion = true
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

    let dot = spring({ x: 50, y: 50, z: 0 }, {
		stiffness: 0.1,
		damping: 0.25
	});
    function handleMotion(e: DeviceMotionEvent){
        
        if(!e.acceleration || e.acceleration.x === null || e.acceleration.y === null || e.acceleration.z === null){
            return
        }
        if(e.acceleration?.x > 10 || e.acceleration?.x < -10){
            console.log("Bump!");
        }
        motion_detected = Math.round(e.acceleration.x) + " " + Math.round(e.acceleration.y) + " " +Math.round(e.acceleration.z)
        dot.set({x: e.acceleration.x, y: e.acceleration.y, z: e.acceleration.z})
    }
    let value = "x"
    const nextValue = () => {
        switch (value) {
            case 'x': value = 'y'; break;
            case 'y': value = 'z'; break;
            case 'z': value = 'x'; break;
        }
    }
</script>
<svelte:window bind:innerWidth={width} bind:innerHeight={height} />
<h1>Bump test</h1>
<p>{error}</p>
<p>Motion {motion_detected}</p>
<p>{value}</p>
<svg style="height: {height-20}px; width: {width-20}px;">
    {#if value === "x"}
        <circle style="fill: #ff3e00;" cx={((width/2)-10)} cy={((height/2)-10)} r={Math.abs($dot.x)*10}/>
    {:else if value === "y"}
        <circle style="fill: #00e1ff;" cx={((width/2)-10)} cy={((height/2)-10)} r={Math.abs($dot.y)*10}/>
    {:else if value === "z"}
        <circle style="fill: #ffc400;" cx={((width/2)-10)} cy={((height/2)-10)} r={Math.abs($dot.z)*10}/>
    {/if}
</svg>

<style>
	svg { margin: -8px }
</style>