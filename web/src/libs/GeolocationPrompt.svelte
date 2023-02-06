<script lang="ts">
    import { PermissionsStore } from "../utils/stores";

    let handle = () => {
        navigator.geolocation.getCurrentPosition((_) => {
            PermissionsStore.update((value) => {
                value.geolocation = true
                return value
            })
        }, (err) => {
            console.log(err)
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        })
    }
</script>

<style>
    .prompt{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        z-index: 100;
    }
</style>
<div class="prompt">
    <h1>Enable location services</h1>
    <p>Location services are required to use this app.</p>
    <button on:click={handle}>Enable</button>
</div>