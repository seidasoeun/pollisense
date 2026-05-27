import type { DeviceStatus, FieldStation } from '../types';

export function getStationById(stations: FieldStation[], stationId: string) {
  return stations.find((station) => station.id === stationId) ?? stations[0];
}

export function getStationDevices(devices: DeviceStatus[], stationId: string) {
  return devices.filter((device) => device.stationId === stationId);
}

export function getStationOperationalSummary(stations: FieldStation[], devices: DeviceStatus[], stationId: string) {
  const selectedStation = getStationById(stations, stationId);
  const stationIndex = stations.findIndex((station) => station.id === stationId);
  const stationDevices = getStationDevices(devices, stationId);
  return {
    selectedStation,
    stationNumber: stationIndex + 1,
    stationDevices,
    onlineDevices: stationDevices.filter((device) => device.status === 'online').length,
    hasIssue: stationDevices.some((device) => device.status !== 'online'),
  };
}

