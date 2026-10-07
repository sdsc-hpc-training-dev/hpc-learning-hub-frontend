/// <reference types="cypress" />

describe("Training discovery", () => {
  it("opens HPC Security and getting help from the selected filters", () => {
    cy.visit("/materials");

    cy.get("#catalog-topic").select("Containers");
    cy.get("#catalog-tool").select("Globus");
    cy.get("#catalog-program").select("COMPLECS");

    cy.contains("a", "HPC Security and getting help").should("be.visible").click();
    cy.get("main h1").should("have.text", "HPC Security and getting help");
    cy.location("pathname").should("match", /^\/materials\/.+/);
  });

  it("searches for Intermediate Linux and opens the training", () => {
    cy.visit("/materials");

    cy.get("#catalog-search").type("Intermediate Linux");
    cy.contains("a", "Intermediate Linux").should("be.visible").click();
    cy.get("main h1").should("contain.text", "Intermediate Linux");
    cy.location("pathname").should("match", /^\/materials\/.+/);
  });

  it("opens GPU Computing and Programming from Getting Started with Expanse", () => {
    cy.visit("/learning-paths");

    cy.contains("article.learning-path-card", "Getting Started with Expanse")
      .contains("a", "View path")
      .click();
    cy.get("main h1").should("contain.text", "Getting Started with Expanse");

    cy.contains("a", "GPU Computing and Programming")
      .should("be.visible")
      .click();
    cy.get("main h1").should("contain.text", "GPU Computing and Programming");
    cy.location("pathname").should("match", /^\/materials\/.+/);
  });
});
