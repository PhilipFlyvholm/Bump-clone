import { describe,it, expect } from 'vitest'
import { calcDistanceInMeters } from './haversine'

describe('haversine', () => {
    it('should calculate distance - first', () => {
        const p1 = {lon: -0.116773,lat: 51.510357}
        const p2 = {lon: -77.009003,lat: 38.889931}
        const distance = calcDistanceInMeters(p1.lat, p2.lat, p1.lon, p2.lon)
        const actual = 5897658.288856053
        expect(distance).toBe(actual)
    })
    it('should calculate distance - second', () => {
        const p1 = {lon: 12.369795688210576,lat: 55.785503201748845}
        const p2 = {lon: 12.369728673647463,lat: 55.785517494840825}

        const distance = calcDistanceInMeters(p1.lat, p2.lat, p1.lon, p2.lon)
        const actual = 4.481320543916289
        expect(distance).toBe(actual)
    })
})


