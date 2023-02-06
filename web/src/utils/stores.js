import { writable } from 'svelte/store';
export const PermissionsStore = writable({
    geolocation: false,
    motion: false
});