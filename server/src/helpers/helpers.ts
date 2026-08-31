export function convertMilesToMeters(miles: number) {
  const meters = miles * 1609.344;
  return parseFloat(meters.toFixed(2));
}

export function convertMetersToMiles(meters: number) {
  const miles = meters / 1609.344;
  return parseFloat(miles.toFixed(2));
}
