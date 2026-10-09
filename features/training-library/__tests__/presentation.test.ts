import {
  catalogPlainText,
  publicResourceTypeLabel,
  resourceTypeSummary,
} from "../presentation";

describe("catalog presentation cleanup", () => {
  it("converts README Markdown and HTML entities to readable text", () => {
    const value =
      "[![DOI](https://zenodo.org/badge.svg)](https://doi.org/example) # SDSC Summer Institute 2019 See the [agenda](https://example.org). Research &amp; training.";

    expect(catalogPlainText(value)).toBe(
      "SDSC Summer Institute 2019 See the agenda. Research & training.",
    );
  });

  it("hides internal metadata and summarizes repository resources", () => {
    expect(
      resourceTypeSummary([
        {
          id: "1",
          title: "Session",
          type: "repository_session",
          url: "https://github.com/sdsc/session",
        },
        {
          id: "2",
          title: "Repository",
          type: "repository",
          url: "https://github.com/sdsc/repository",
        },
        { id: "3", title: "Metadata", type: "catalog_metadata" },
      ]),
    ).toBe("Repository materials");
    expect(publicResourceTypeLabel("catalog_metadata")).toBeNull();
  });

  it("summarizes only public links using their user-facing purpose", () => {
    expect(
      resourceTypeSummary([
        {
          id: "1",
          title: "GitHub",
          type: "webpage",
          url: "https://github.com/sdsc/example",
        },
        {
          id: "2",
          title: "Webinar Recording",
          type: "webpage",
          url: "https://youtube.com/watch?v=example",
        },
        { id: "3", title: "Transcript", type: "transcript", url: null },
      ]),
    ).toBe("Source repository + Recording");
  });
});
