import { materialOpenEvent, resourceOpenEvent } from "../events";

describe("Umami event attributes", () => {
  it("tracks a catalog material without sending its title or URL", () => {
    expect(materialOpenEvent("material-1")).toEqual({
      "data-umami-event": "material-open",
      "data-umami-event-material-id": "material-1",
    });
  });

  it("identifies the resource and its format", () => {
    expect(resourceOpenEvent("material-1", "resource-2", "video")).toEqual({
      "data-umami-event": "resource-open",
      "data-umami-event-material-id": "material-1",
      "data-umami-event-resource-id": "resource-2",
      "data-umami-event-resource-type": "video",
    });
  });
});
