<script lang="ts">
	import { onMount } from 'svelte';
	import { Scale } from '@unovis/ts';
	import { VisXYContainer, VisLine, VisAxis, VisBulletLegend } from '@unovis/svelte';

	type dot = { x: number; y: number; z: number; tick: number };

	let motion_detected = 'Motion not allowed';
	let tested_motion = false;
	let error = '';
	let paused = false;
	let ready = false;
	let test_data = false;
	onMount(() => {
		window.addEventListener('click', () => {
			if (!tested_motion) requestAccessAsync();
		});
		if(test_data){
			for (let i = 0; i < 100; i++) {
				let x = Math.sin(i);
				let y = Math.cos(i);
				let z = Math.tan(i);
				dots.push({ x: x, y: y, z: z, tick: i++ });
			}
			dots = dots;
		}
		ready = true;
	});

	const requestAccessAsync = async (): Promise<boolean> => {
		tested_motion = true;
		if (!DeviceOrientationEvent) {
			error = 'Device orientation event is not supported by your browser';
			return false;
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

	let i = 0;
	let dots: dot[] = [];
	function handleMotion(e: DeviceMotionEvent) {
		if (paused) return;
		if (
			!e.acceleration ||
			e.acceleration.x === null ||
			e.acceleration.y === null ||
			e.acceleration.z === null
		) {
			return;
		}
		let x = e.acceleration.x;
		let y = e.acceleration.y;
		let z = e.acceleration.z;
		if (x > 10 || x < -10) {
			console.log('Bump!');
		}
		motion_detected = Math.round(x) + ' ' + Math.round(y) + ' ' + Math.round(z);
		dots.push({ x: x, y: y, z: z, tick: i++ });
		dots = dots;
		textArea += x + ',' + y + ',' + z + ',' + i + '\n';
		
	}
	const x = (d: dot) => d.tick;
	const y = [(d: dot) => d.x, (d: dot) => d.y, (d: dot) => d.z];
	let textArea = "";
	dots.forEach((d) => {
		textArea += d.x + ',' + d.y + ',' + d.z + ',' + d.tick + '\n';
	})
</script>

<h1>Bump test</h1>
<p>{error}</p>
<p>Motion {motion_detected}</p>
{#if ready}
	<VisXYContainer data={dots} height={300}>
		<VisLine {x} {y} />
		<VisAxis type="x" label="Tick" />
		<VisAxis type="y" label="Value" />
	</VisXYContainer>
{/if}
<!--<VisBulletLegend {['x','y','z']}/>-->
<button
	on:click={() => {
		paused = !paused;
	}}>{paused ? 'Resume' : 'Pause'}</button
>
<button
	on:click={() => {
		dots = [];
	}}>Clear  </button>

<textarea>
	{textArea}
</textarea>