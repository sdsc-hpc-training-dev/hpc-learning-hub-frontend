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
});

describe("encoded catalog text", () => {
  it.each([
    ["Cheap &amp; FAIR Data Practices", "Cheap & FAIR Data Practices"],
    [
      "Python technologies&#8212;Numba and Dask&#8212;for HPC",
      "Python technologies\u2014Numba and Dask\u2014for HPC",
    ],
    [
      "&copy; SDSC &ndash; &ldquo;Training&rdquo; &eacute;",
      "\u00a9 SDSC \u2013 \u201cTraining\u201d \u00e9",
    ],
    [
      "Use MPI_COMM_WORLD and vector<T>; x < y && y > z.",
      "Use MPI_COMM_WORLD and vector<T>; x < y && y > z.",
    ],
    ["<p>First</p><p>Second<br>Third</p>", "First Second Third"],
    [
      "Read <b>HPC</b> &lt;https://example.org/a_b&gt;",
      "Read HPC https://example.org/a_b",
    ],
    [
      "<script>alert('bad')</script><style>body {color:red}</style>Safe",
      "Safe",
    ],
    ["Safe<script>never shown", "Safe"],
    ["Safe<!-- hidden --><template><b>hidden</b></template> text", "Safe text"],
    ["&#x110000; &#55296; &unknown;", "\ufffd \ufffd &unknown;"],
  ])("cleans catalog text without executing HTML: %s", (input, expected) => {
    expect(catalogPlainText(input)).toBe(expected);
    expect(catalogPlainText(expected)).toBe(expected);
  });

  it.each([
    'SDSC Summer Institute 2026 <a name="top" </a This repository hosts all material and slides.',
    "SDSC Summer Institute 2026 <a id='top' </a This repository hosts all material and slides.",
    'SDSC Summer Institute 2026 <a name="top"></a> This repository hosts all material and slides.',
    'SDSC Summer Institute 2026 &lt;a name="top" &lt;/a This repository hosts all material and slides.',
  ])("preserves the prose after empty legacy README anchors: %s", (input) => {
    expect(catalogPlainText(input)).toBe(
      "SDSC Summer Institute 2026 This repository hosts all material and slides.",
    );
  });

  it("handles absent values and leaves ordinary sentences unchanged", () => {
    expect(catalogPlainText(null)).toBe("");
    expect(catalogPlainText(undefined)).toBe("");
    expect(catalogPlainText("Learn C++ and C# on Expanse.")).toBe(
      "Learn C++ and C# on Expanse.",
    );
  });
});

describe("catalog resource presentation", () => {
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
  it("preserves the existing master cleanup for broken empty anchors and breaks", () => {
    expect(catalogPlainText('<a class="empty" </a Real prose<br More prose')).toBe("Real prose More prose");
    expect(catalogPlainText("<br")).toBe("");
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
