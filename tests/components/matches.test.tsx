import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MatchesScreen } from "@/components/matches/MatchesScreen";
import { POOJA, ZOYA, json, makeMatch, mockFetch } from "./test-utils";

describe("MatchesScreen", () => {
  it("lists mutual matches with photo, name, age, location and date", async () => {
    mockFetch({
      "/api/matches": () =>
        json(200, { data: { matches: [makeMatch(ZOYA, "2026-11-19T10:00:00.000Z"), makeMatch(POOJA)] } }),
    });
    render(<MatchesScreen />);
    const list = await screen.findByRole("list", { name: "Your matches" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByRole("heading")).toHaveTextContent("Zoya, 24");
    expect(within(items[0]).getByAltText("Photo of Zoya")).toBeInTheDocument();
    expect(within(items[0]).getByText("Bengaluru")).toBeInTheDocument();
    expect(within(items[0]).getByText(/19 Nov 2026/)).toBeInTheDocument();
    expect(screen.getByText("2 mutual matches")).toBeInTheDocument();
  });

  it("shows a loading state first", () => {
    mockFetch({ "/api/matches": () => new Promise(() => {}) });
    render(<MatchesScreen />);
    expect(screen.getByRole("status", { name: "Loading matches" })).toBeInTheDocument();
  });

  it("shows the empty state", async () => {
    mockFetch({ "/api/matches": () => json(200, { data: { matches: [] } }) });
    render(<MatchesScreen />);
    expect(await screen.findByRole("heading", { name: "No matches yet" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start discovering" })).toHaveAttribute("href", "/discover");
  });

  it("shows an error state and retries", async () => {
    let calls = 0;
    mockFetch({
      "/api/matches": () =>
        ++calls === 1 ? json(500, { error: { code: "INTERNAL_ERROR", message: "x" } }) : json(200, { data: { matches: [makeMatch(ZOYA)] } }),
    });
    render(<MatchesScreen />);
    await userEvent.click(await screen.findByRole("button", { name: "Try again" }));
    await waitFor(() => expect(screen.getByText("1 mutual match")).toBeInTheDocument());
  });
});
