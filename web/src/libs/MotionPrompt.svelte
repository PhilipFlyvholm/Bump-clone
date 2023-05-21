<script lang="ts">
	import { onMount } from 'svelte';
	import { PermissionsStore } from '../utils/stores';
    export let handleMotion: (e: DeviceMotionEvent) => void;
    let error = '';
    
    onMount(() => {
        if ( typeof DeviceOrientationEvent === 'undefined' ||
            !(DeviceOrientationEvent as any).requestPermission ||
            typeof (DeviceMotionEvent as any).requestPermission !== 'function'
        ) {

            PermissionsStore.update((value) => {
                value.motion = true;
                return value;
            });
        }
    });

	let handle = async () => {
        
        if (!DeviceOrientationEvent) {
            error = 'Device orientation event is not supported by your browser';
            return;
        }
        if (
            (DeviceOrientationEvent as any).requestPermission &&
            typeof (DeviceMotionEvent as any).requestPermission === 'function'
        ) {
            let permission: PermissionState;
            try {
                console.log('Requesting permission...');
                permission = await (DeviceOrientationEvent as any).requestPermission();
            } catch (err: any) {
                error = err.message;
                return 
            }
            if (permission !== 'granted') {
                error = 'Request to access the device orientation was rejected';
                return;
            }
            PermissionsStore.update((value) => {
                value.motion = true;
                return value;
            });
        }

        window.addEventListener('devicemotion', handleMotion);
	};
</script>

<div class="prompt">
	<h1>Enable motion detection</h1>
	<p>Motion detection is needed to detect a bump.</p>
    {#if error}
        <p>{error}</p>
    {/if}
	<button on:click={handle}>Enable</button>
</div>

<style>
	.prompt {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		z-index: 100;
	}
</style>
