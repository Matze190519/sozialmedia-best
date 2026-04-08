import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("Design Upgrade: Schwarz + Gold Theme", () => {
  const indexCss = readFileSync(resolve(__dirname, "../client/src/index.css"), "utf-8");
  const dashboardLayout = readFileSync(resolve(__dirname, "../client/src/components/DashboardLayout.tsx"), "utf-8");
  const homePage = readFileSync(resolve(__dirname, "../client/src/pages/Home.tsx"), "utf-8");
  const libraryPage = readFileSync(resolve(__dirname, "../client/src/pages/LibraryPage.tsx"), "utf-8");
  const indexHtml = readFileSync(resolve(__dirname, "../client/index.html"), "utf-8");

  it("should use gold primary color (oklch)", () => {
    expect(indexCss).toContain("--gold-light");
    expect(indexCss).toContain("--gold-mid");
    expect(indexCss).toContain("--gold-dark");
    expect(indexCss).toContain("--primary: oklch(0.78 0.13 80)");
  });

  it("should have deep black background", () => {
    expect(indexCss).toContain("--background: oklch(0.08");
  });

  it("should include gold gradient text class", () => {
    expect(indexCss).toContain(".gold-text");
    expect(indexCss).toContain("#d4af37");
    expect(indexCss).toContain("#f5d060");
  });

  it("should include gold button variant", () => {
    expect(indexCss).toContain(".btn-gold");
  });

  it("should include bottom tab bar styles for mobile", () => {
    expect(indexCss).toContain(".bottom-tab-bar");
    expect(indexCss).toContain(".bottom-tab-item");
    expect(indexCss).toContain("safe-area-inset-bottom");
  });

  it("should include Montserrat font for headings", () => {
    expect(indexCss).toContain("Montserrat");
    expect(indexHtml).toContain("Montserrat");
  });

  it("should have gold glow effects", () => {
    expect(indexCss).toContain(".glow-gold");
    expect(indexCss).toContain(".glow-primary");
  });

  it("should use gold-text class in Home page quick actions", () => {
    expect(homePage).toContain("gold-text");
    expect(homePage).toContain("Content erstellen");
    expect(homePage).toContain("Freigeben");
    expect(homePage).toContain("Bibliothek");
  });

  it("should have 1-Tap Copy in Library page", () => {
    expect(libraryPage).toContain("handleCopyAll");
    expect(libraryPage).toContain("handleDownloadImage");
    expect(libraryPage).toContain("Text + Hashtags kopieren");
    expect(libraryPage).toContain("Bild speichern");
  });

  it("should have mobile bottom tab bar in DashboardLayout", () => {
    expect(dashboardLayout).toContain("bottom-tab-bar");
    expect(dashboardLayout).toContain("bottom-tab-item");
  });

  it("should include glass card styles", () => {
    expect(indexCss).toContain(".glass-card");
    expect(indexCss).toContain("backdrop-filter");
  });

  it("should have gold shimmer animation", () => {
    expect(indexCss).toContain(".gold-shimmer");
    expect(indexCss).toContain("@keyframes shimmer");
  });
});
