describe("Portal sections", () => {
  it("opens the Training Library", () => {
    cy.visit("/materials");

    cy.get("main h1").should(
      "contain.text",
      "Search by what you want to learn or use.",
    );
    cy.location("pathname").should("equal", "/materials");
  });

  it("opens Learning Paths", () => {
    cy.visit("/learning-paths");

    cy.get("main h1").should(
      "contain.text",
      "Start with a sequence, not a search box.",
    );
    cy.location("pathname").should("equal", "/learning-paths");
  });

  it("opens Events", () => {
    cy.visit("/events");

    cy.get("main h1").should(
      "contain.text",
      "Attend what is next. Learn from what already happened.",
    );
    cy.location("pathname").should("equal", "/events");
  });

  it("opens Programs and Series", () => {
    cy.visit("/programs");

    cy.get("main h1").should(
      "contain.text",
      "See how individual sessions fit into a larger program.",
    );
    cy.location("pathname").should("equal", "/programs");
  });
});
