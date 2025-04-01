export interface PISConfig {
    pk: string
    sk: string
    createdAt: string
    device_type: string
    device_wait: number
    distance_range_meters: number
    door_name: string
    door_no: number
    endpoint_protocol: string
    geolocation_coordinates: GeolocationCoordinates
    is_sharedwifi: boolean
    mqtt_endpoint: string
    mqtt_topic: string
    mqtt_topic_format: string
    updatedAt: string
}

export interface GeolocationCoordinates {
    latitude: number
    longitude: number
}

export const PISConfigSK = 'config';