/* eslint-disable no-undef, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/restrict-template-expressions, max-lines-per-function */

export async function scanInteractions(page, route, scan) {
  for (const viewport of [
    { name: "desktop", width: 1280, height: 720 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await scan(`${viewport.name}: initial`);

    const disclosures = page.locator(
      'button[aria-expanded="false"], details > summary',
    );
    const disclosureCount = await disclosures.count();
    for (let index = 0; index < disclosureCount; index += 1) {
      // Restore the same initial state before testing each disclosure.
      await page.goto(route, { waitUntil: "load" });
      const control = page
        .locator('button[aria-expanded="false"], details > summary')
        .nth(index);
      if (!(await control.isVisible())) continue;
      await control.focus();
      await control.press("Enter");
      await page.waitForFunction(
        (element) =>
          element.tagName === "SUMMARY"
            ? element.parentElement.open
            : element.getAttribute("aria-expanded") === "true",
        await control.elementHandle(),
      );
      await scan(`${viewport.name}: disclosure ${index + 1} open`);
    }

    await page.goto(route, { waitUntil: "load" });
    if (new URL(route).pathname !== "/materials") continue;

    const filters = page.locator(".catalog-filters select");
    for (let index = 0; index < (await filters.count()); index += 1) {
      const filter = filters.nth(index);
      const options = await filter
        .locator("option")
        .evaluateAll((elements) =>
          elements
            .filter((element) => element.value && !element.disabled)
            .map((element) => element.value),
        );
      for (const value of options) {
        await filter.selectOption(value);
        await page.locator(".filter-chip").first().waitFor();
        await scan(
          `${viewport.name}: ${await filter.getAttribute("id")}=${value}`,
        );
        await page.locator(".filter-chip").first().focus();
        await page.locator(".filter-chip").first().press("Enter");
        await page.waitForFunction(
          () => !document.querySelector(".filter-chip"),
        );
        await scan(`${viewport.name}: filter removed`);
      }
    }

    await page.locator("#catalog-date").fill("1900-01-01");
    await page.locator(".empty-state").waitFor();
    await scan(`${viewport.name}: date filter and empty results`);
    const reset = page
      .locator(".empty-state")
      .getByRole("button", { name: "Reset filters" });
    await reset.focus();
    await reset.press("Enter");
    await page.waitForFunction(() => !document.querySelector(".filter-chip"));
    await scan(`${viewport.name}: reset filters`);

    // A real keyword exposes the dynamically rendered removal button.
    await page.locator("#catalog-search").fill("computing");
    await page.locator(".filter-chip").first().waitFor();
    await scan(`${viewport.name}: search active`);
    await page
      .locator(".catalog-toolbar")
      .getByRole("button", { name: "Reset filters" })
      .click();
    await page.waitForFunction(() => !document.querySelector(".filter-chip"));
    await scan(`${viewport.name}: search reset`);
  }
}
