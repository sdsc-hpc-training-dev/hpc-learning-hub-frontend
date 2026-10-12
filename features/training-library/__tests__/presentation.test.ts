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

  it("decodes nested HTML entities from retained source text", () => {
    expect(catalogPlainText("Join SDSC &amp;#160; at SC26")).toBe(
      "Join SDSC at SC26",
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

describe("catalog badge cleanup", () => {
  it("removes damaged empty README anchors while preserving surrounding prose", () => {
    expect(
      catalogPlainText(
        'SDSC Summer Institute 2026 <a name="top" </a This repository hosts slides.',
      ),
    ).toBe("SDSC Summer Institute 2026 This repository hosts slides.");
    expect(catalogPlainText('See <a href="/agenda">the agenda</a>.')).toBe(
      "See the agenda .",
    );
    expect(catalogPlainText("Use values < 5 in this example.")).toBe(
      "Use values < 5 in this example.",
    );
    expect(
      catalogPlainText("Mai Nguyen <br / Paul Rodriguez </br Jon Stephens"),
    ).toBe("Mai Nguyen Paul Rodriguez Jon Stephens");
  });

  it("removes malformed Creative Commons badges without losing real prose", () => {
    const badge =
      '<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/" <img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/80x15.png" / </a';

    expect(catalogPlainText(badge)).toBe("");
    expect(catalogPlainText(`${badge} SDSC Summer Institute 2021`)).toBe(
      "SDSC Summer Institute 2021",
    );
  });
});
