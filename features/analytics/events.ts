export function materialOpenEvent(materialId: string) {
  return {
    "data-umami-event": "material-open",
    "data-umami-event-material-id": materialId,
  };
}

export function resourceOpenEvent(
  materialId: string,
  resourceId: string,
  resourceType: string,
) {
  return {
    "data-umami-event": "resource-open",
    "data-umami-event-material-id": materialId,
    "data-umami-event-resource-id": resourceId,
    "data-umami-event-resource-type": resourceType,
  };
}
