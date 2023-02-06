<script lang="ts">
	import { onMount, tick } from 'svelte';

	let motion_detected = 'Motion not allowed';
	let tested_motion = false;
	let error = '';
	let height: number,
		width: number = 0;
	onMount(() => {
		window.addEventListener('click', () => {
			if (!tested_motion) requestAccessAsync();
		});
        //window.addEventListener('devicemotion', handleMotion);
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
    let i = 0
    let max = 1
    let min = -1
	let dots: {x: number, y:number,z:number, time: number}[] = []
	function handleMotion(e: DeviceMotionEvent) {
        console.log(e);
		if (
			!e.acceleration ||
			e.acceleration.x === null ||
			e.acceleration.y === null ||
			e.acceleration.z === null
		) {
			return;
		}
        let x = e.acceleration.x
        let y = e.acceleration.y
        let z = e.acceleration.z
		if (x > 10 || x < -10) {
			console.log('Bump!');
		}
		motion_detected =
			Math.round(x) +
			' ' +
			Math.round(y) +
			' ' +
			Math.round(z);
        if(x > max) max = x
        if(x < min) min = x
        if(y > max) max = y
        if(y < min) min = y
        if(z > max) max = z
        if(z < min) min = z
        yAxes = generateYAxes()
        if(dots.length > 30) dots.shift()
        if(i > 30) i = 0
        dots.push({x: x, y: y, z: z, time: i++})
        dots = dots
    }
    let spaceBetween = 20
    const generateYAxes = () => {
        let yAxes = []
        let y = min
        let space = (max-min)/5
        while(y < max) {
            yAxes.push(y.toFixed(2))
            y += space
        }
        yAxes.push(max.toFixed(2))
        return yAxes
    }
    let yAxes = generateYAxes()
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />
<h1>Bump test</h1>
<p>{error}</p>
<!--{#each dots as dot}
    <p>{dot.x} {dot.y} {dot.z}</p>
{/each}-->
<p>Motion {motion_detected}</p>
<!--<svg style="height: {height-20}px; width: {width-20}px;">
        <circle style="fill: #ff3e00;" cx={((width/2)-10)} cy={((height/2)-10)} r={Math.abs($dot.x)*10}/>
        <circle style="fill: #00e1ff;" cx={((width/2)-10)} cy={((height/2)-10)} r={Math.abs($dot.y)*10}/>
        <circle style="fill: #ffc400;" cx={((width/2)-10)} cy={((height/2)-10)} r={Math.abs($dot.z)*10}/>
</svg>-->
<svg
	version="1.2"
	
	xmlns="http://www.w3.org/2000/svg"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	class="graph"
	aria-labelledby="title"
	role="img"
>
	<title id="title">A line chart showing some information</title>
	<g class="grid x-grid" id="xGrid">
		<line x1="90" x2="90" y1="5" y2="371" />
	</g>
	<g class="grid y-grid" id="yGrid">
		<line x1="90" x2="705" y1="370" y2="370" />
	</g>
	<g class="labels x-labels">
        {#each dots as dot}
            <text x={100+dot.time*spaceBetween} y="400">{dot.time}</text>
        {/each}
		<text x="400" y="440" class="label-title">Time</text>
	</g>
	<g class="labels y-labels">
        {#each yAxes as y, i}
            <text x="80" y={373-((373-15)/5)*i}>{y}</text>
        {/each}
		<text x="50" y="200" class="label-title">Value</text>
	</g>
	<g data-setname="Our first data set">
		{#each dots as dot}
			<circle class="data x" cx={90 + dot.time * spaceBetween} cy={370-(((dot.x-min)/(max-min))*370)} data-value={dot.x} r="4" />
			<circle class="data y"cx={90 + dot.time * spaceBetween} cy={370-(((dot.y-min)/(max-min))*370)} data-value={dot.y} r="4" />
			<circle class="data z"cx={90 + dot.time * spaceBetween} cy={370-(((dot.z-min)/(max-min))*370)} data-value={dot.z} r="4" />
		{/each}
	</g>
</svg>
<style>
	svg {
		margin: -8px;
	}
    .graph {
        height: 500px;
        width: 800px;
    }
	.graph .labels.x-labels {
		text-anchor: middle;
	}

	.graph .labels.y-labels {
		text-anchor: end;
	}

	.graph .grid {
		stroke: #ccc;
		stroke-dasharray: 0;
		stroke-width: 1;
	}

	.labels {
		font-size: 13px;
	}

	.label-title {
		font-weight: bold;
		text-transform: uppercase;
		font-size: 12px;
		fill: white;
	}
	text {
		fill: white;
	}

	.data {
		fill: red;
		stroke-width: 1;
	}
    .data.x{
        fill: #ff3e00;
    }
    .data.y{
        fill: #00e1ff;
    }
    .data.z{
        fill: #ffc400;
    }
</style>
