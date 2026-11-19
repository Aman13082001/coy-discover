import { act, fireEvent, render, renderHook, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { DiscoverScreen } from "@/components/discover/DiscoverScreen";
import { ProfileCard } from "@/components/discover/ProfileCard";
import { useSwipe } from "@/hooks/useSwipe";
import type { PublicProfile } from "@/lib/types";
import { routerPush } from "../setup/dom";
import { ME, POOJA, ROHAN, ZOYA, json, makeMatch, mockFetch, swipeCalls } from "./test-utils";

const feed = (...profiles: PublicProfile[]) => () => json(200, { data: { profiles } });
const noMatch = (url: string, init?: RequestInit) => {
  const { profileId, action } = JSON.parse(String(init?.body));
  return json(201, { data: { swipe: { profileId, action }, match: null } });
};
const topCardName = () =>
  within(screen.getByTestId("top-card")).getByRole("heading", { level: 2 }).textContent;

describe("ProfileCard", () => {
  it("renders photo, name, age, location, bio and interests", () => {
    render(<ProfileCard profile={POOJA} />);
    expect(screen.getByRole("heading", { name: /Pooja\s*24/ })).toBeInTheDocument();
    expect(screen.getByAltText("Photo of Pooja")).toHaveAttribute("src", "/profiles/pooja.jpg");
    expect(screen.getByText("Jaipur")).toBeInTheDocument();
    expect(screen.getByText("Pooja's bio")).toBeInTheDocument();
    const interests = within(screen.getByRole("list", { name: "Interests" })).getAllByRole("listitem");
    expect(interests.map((li) => li.textContent)).toEqual(["Textiles", "Pottery"]);
  });

  it("falls back to an initial when the photo fails", () => {
    render(<ProfileCard profile={POOJA} />);
    fireEvent.error(screen.getByAltText("Photo of Pooja"));
    expect(screen.getByRole("img", { name: /Pooja \(photo unavailable\)/ })).toBeInTheDocument();
  });
});

describe("DiscoverScreen", () => {
  it("shows a loading state, then one profile at a time", async () => {
    let release!: () => void;
    mockFetch({ "/api/feed": () => new Promise((r) => (release = () => r(feed(POOJA, ROHAN)()))) });
    render(<DiscoverScreen me={ME} />);
    expect(screen.getByRole("status", { name: "Loading profiles" })).toBeInTheDocument();
    act(() => release());
    await waitFor(() => expect(topCardName()).toMatch(/Pooja/));
    expect(screen.getAllByTestId("top-card")).toHaveLength(1);
  });

  it("Like button sends LIKE and advances to the next profile", async () => {
    const fetch = mockFetch({ "/api/feed": feed(POOJA, ROHAN), "/api/swipe": noMatch });
    render(<DiscoverScreen me={ME} />);
    await userEvent.click(await screen.findByRole("button", { name: "Like Pooja" }));
    await waitFor(() => expect(topCardName()).toMatch(/Rohan/));
    expect(swipeCalls(fetch)).toEqual([{ profileId: "pooja", action: "LIKE" }]);
    expect(screen.getByText("You liked Pooja")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("Pass button sends PASS and advances", async () => {
    const fetch = mockFetch({ "/api/feed": feed(POOJA, ROHAN), "/api/swipe": noMatch });
    render(<DiscoverScreen me={ME} />);
    await userEvent.click(await screen.findByRole("button", { name: "Pass on Pooja" }));
    await waitFor(() => expect(topCardName()).toMatch(/Rohan/));
    expect(swipeCalls(fetch)).toEqual([{ profileId: "pooja", action: "PASS" }]);
  });

  it("arrow keys pass and like", async () => {
    const fetch = mockFetch({ "/api/feed": feed(POOJA, ROHAN, ZOYA), "/api/swipe": noMatch });
    render(<DiscoverScreen me={ME} />);
    await screen.findByRole("button", { name: "Like Pooja" });
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(topCardName()).toMatch(/Rohan/));
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(topCardName()).toMatch(/Zoya/));
    expect(swipeCalls(fetch)).toEqual([
      { profileId: "pooja", action: "PASS" },
      { profileId: "rohan", action: "LIKE" },
    ]);
  });

  it("shows the match overlay with both photos, and can continue or go to matches", async () => {
    mockFetch({
      "/api/feed": feed(ZOYA, ROHAN),
      "/api/swipe": () => json(201, { data: { swipe: { profileId: "zoya", action: "LIKE" }, match: makeMatch(ZOYA) } }),
    });
    render(<DiscoverScreen me={ME} />);
    await userEvent.click(await screen.findByRole("button", { name: "Like Zoya" }));

    const dialog = await screen.findByRole("dialog", { name: "It's a match!" });
    expect(within(dialog).getByText(/You and/)).toHaveTextContent("You and Zoya liked each other.");
    expect(within(dialog).getByAltText("Photo of Arjun")).toBeInTheDocument();
    expect(within(dialog).getByAltText("Photo of Zoya")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "See your matches" })).toHaveFocus();

    await userEvent.click(within(dialog).getByRole("button", { name: "Keep discovering" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(topCardName()).toMatch(/Rohan/);
  });

  it("'See your matches' navigates to the Matches tab", async () => {
    mockFetch({
      "/api/feed": feed(ZOYA),
      "/api/swipe": () => json(201, { data: { swipe: { profileId: "zoya", action: "LIKE" }, match: makeMatch(ZOYA) } }),
    });
    render(<DiscoverScreen me={ME} />);
    await userEvent.click(await screen.findByRole("button", { name: "Like Zoya" }));
    await userEvent.click(await screen.findByRole("button", { name: "See your matches" }));
    expect(routerPush).toHaveBeenCalledWith("/matches");
  });

  it("shows the empty state when there is nobody left", async () => {
    mockFetch({ "/api/feed": feed() });
    render(<DiscoverScreen me={ME} />);
    expect(await screen.findByRole("heading", { name: "You're all caught up" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Like/ })).not.toBeInTheDocument();
  });

  it("shows the empty state after swiping the last profile", async () => {
    mockFetch({ "/api/feed": feed(POOJA), "/api/swipe": noMatch });
    render(<DiscoverScreen me={ME} />);
    await userEvent.click(await screen.findByRole("button", { name: "Pass on Pooja" }));
    expect(await screen.findByRole("heading", { name: "You're all caught up" })).toBeInTheDocument();
  });

  it("shows an error state when the feed fails, and retries", async () => {
    let calls = 0;
    mockFetch({
      "/api/feed": () => (++calls === 1 ? json(500, { error: { code: "INTERNAL_ERROR", message: "x" } }) : feed(POOJA)()),
    });
    render(<DiscoverScreen me={ME} />);
    expect(await screen.findByRole("heading", { name: "Something went wrong" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(topCardName()).toMatch(/Pooja/));
  });

  it("rolls back a failed swipe: the card returns to the top with an error", async () => {
    mockFetch({
      "/api/feed": feed(POOJA, ROHAN),
      "/api/swipe": () => json(500, { error: { code: "INTERNAL_ERROR", message: "boom" } }),
    });
    render(<DiscoverScreen me={ME} />);
    await userEvent.click(await screen.findByRole("button", { name: "Like Pooja" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Pooja is back on top");
    expect(topCardName()).toMatch(/Pooja/);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss error" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("rolls back when offline", async () => {
    mockFetch({
      "/api/feed": feed(POOJA, ROHAN),
      "/api/swipe": () => Promise.reject(new TypeError("Failed to fetch")),
    });
    render(<DiscoverScreen me={ME} />);
    await userEvent.click(await screen.findByRole("button", { name: "Pass on Pooja" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("offline");
    expect(topCardName()).toMatch(/Pooja/);
  });

  it("treats 409 ALREADY_SWIPED as recorded and does not bring the card back", async () => {
    mockFetch({
      "/api/feed": feed(POOJA, ROHAN),
      "/api/swipe": () => json(409, { error: { code: "ALREADY_SWIPED", message: "dup" } }),
    });
    render(<DiscoverScreen me={ME} />);
    await userEvent.click(await screen.findByRole("button", { name: "Like Pooja" }));
    await waitFor(() => expect(topCardName()).toMatch(/Rohan/));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("DiscoverScreen: review regressions", () => {
  const MEERA = { ...ZOYA, id: "meera", name: "Meera", photoUrl: "/profiles/meera.jpg" };

  it("queues two quick matches so each gets its own overlay", async () => {
    const pending: Record<string, (r: Response) => void> = {};
    mockFetch({
      "/api/feed": feed(MEERA, ZOYA, ROHAN),
      "/api/swipe": (_u, init) => {
        const { profileId } = JSON.parse(String(init?.body));
        return new Promise<Response>((r) => (pending[profileId] = r));
      },
    });
    render(<DiscoverScreen me={ME} />);
    await userEvent.click(await screen.findByRole("button", { name: "Like Meera" }));
    await userEvent.click(await screen.findByRole("button", { name: "Like Zoya" }));
    const reply = (p: typeof ZOYA) =>
      json(201, { data: { swipe: { profileId: p.id, action: "LIKE" }, match: makeMatch(p) } });
    await act(async () => {
      pending.meera(reply(MEERA));
      pending.zoya(reply(ZOYA));
    });

    expect(await screen.findByText(/You and/)).toHaveTextContent("You and Meera liked each other.");
    await userEvent.click(screen.getByRole("button", { name: "Keep discovering" }));
    expect(await screen.findByText(/You and/)).toHaveTextContent("You and Zoya liked each other.");
    await userEvent.click(screen.getByRole("button", { name: "Keep discovering" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("a held arrow key (auto-repeat) swipes only once", async () => {
    const fetch = mockFetch({ "/api/feed": feed(POOJA, ROHAN, ZOYA), "/api/swipe": noMatch });
    render(<DiscoverScreen me={ME} />);
    await screen.findByRole("button", { name: "Like Pooja" });
    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "ArrowRight", repeat: true });
    fireEvent.keyDown(window, { key: "ArrowRight", repeat: true });
    await waitFor(() => expect(topCardName()).toMatch(/Rohan/));
    expect(swipeCalls(fetch)).toEqual([{ profileId: "pooja", action: "LIKE" }]);
  });

  it("after a lost response, retrying the like still shows the match", async () => {
    let call = 0;
    mockFetch({
      "/api/feed": feed(ZOYA, ROHAN),
      "/api/swipe": () =>
        ++call === 1
          ? Promise.reject(new TypeError("Failed to fetch"))
          : json(200, { data: { swipe: { profileId: "zoya", action: "LIKE" }, match: makeMatch(ZOYA) } }),
    });
    render(<DiscoverScreen me={ME} />);
    await userEvent.click(await screen.findByRole("button", { name: "Like Zoya" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Zoya is back on top");
    await userEvent.click(screen.getByRole("button", { name: "Like Zoya" }));
    expect(await screen.findByRole("dialog", { name: "It's a match!" })).toBeInTheDocument();
  });

  it("keeps keyboard focus inside the match dialog and makes the deck inert", async () => {
    mockFetch({
      "/api/feed": feed(ZOYA, ROHAN),
      "/api/swipe": () => json(201, { data: { swipe: { profileId: "zoya", action: "LIKE" }, match: makeMatch(ZOYA) } }),
    });
    render(<DiscoverScreen me={ME} />);
    await userEvent.click(await screen.findByRole("button", { name: "Like Zoya" }));
    const dialog = await screen.findByRole("dialog");
    const primary = within(dialog).getByRole("button", { name: "See your matches" });
    const secondary = within(dialog).getByRole("button", { name: "Keep discovering" });
    expect(primary).toHaveFocus();
    await userEvent.tab();
    expect(secondary).toHaveFocus();
    await userEvent.tab();
    expect(primary).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(secondary).toHaveFocus();
    expect(screen.getByRole("button", { name: "Like Rohan", hidden: true }).closest("[inert]")).not.toBeNull();
  });
});

describe("useSwipe", () => {
  it("ignores a second swipe on the same profile while the first is in flight", async () => {
    let resolve!: (r: Response) => void;
    const fetch = mockFetch({ "/api/swipe": () => new Promise<Response>((r) => (resolve = r)) });
    const { result } = renderHook(() => {
      const [profiles, setProfiles] = useState([POOJA, ROHAN]);
      return { profiles, ...useSwipe(setProfiles) };
    });

    act(() => {
      void result.current.swipe(POOJA, "LIKE");
      void result.current.swipe(POOJA, "LIKE");
      void result.current.swipe(POOJA, "PASS");
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.current.profiles.map((p) => p.id)).toEqual(["rohan"]);

    await act(async () => resolve(json(201, { data: { swipe: { profileId: "pooja", action: "LIKE" }, match: null } })));
    expect(result.current.profiles.map((p) => p.id)).toEqual(["rohan"]);
  });
});
