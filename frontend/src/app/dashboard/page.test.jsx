import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import DashboardPage from "./page";
import { apiFetch } from "@/lib/api";

const router = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("next/link", () => ({
  default: ({ children }) => children,
}));

vi.mock("@/lib/api", () => ({
  apiFetch: vi.fn(),
}));

function unauthorizedError() {
  return Object.assign(new Error("Unauthenticated."), { status: 401 });
}

function mockAuthenticatedRequests() {
  apiFetch.mockImplementation(async (path) => {
    if (path === "/user") {
      return { user: { name: "Weather User", email: "weather@example.com" } };
    }

    return {
      weather: {
        status: "not_configured",
        city: "London",
        message: "Weather provider is not configured.",
      },
    };
  });
}

describe("DashboardPage authentication guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading until the session is checked, then renders the authenticated dashboard", async () => {
    let resolveUser;
    apiFetch
      .mockImplementationOnce(() => new Promise((resolve) => { resolveUser = resolve; }))
      .mockResolvedValueOnce({ weather: { city: "London" } });

    render(<DashboardPage />);

    expect(screen.getByText("Loading dashboard...")).toBeTruthy();
    expect(screen.queryByText(/Welcome,/)).toBeNull();

    await act(async () => {
      resolveUser({ user: { name: "Weather User", email: "weather@example.com" } });
    });

    expect(await screen.findByText("Welcome, Weather User")).toBeTruthy();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("redirects an unauthenticated direct visit to login without rendering dashboard content", async () => {
    apiFetch.mockRejectedValue(unauthorizedError());

    render(<DashboardPage />);

    expect(screen.getByText("Loading dashboard...")).toBeTruthy();
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/login"));
    expect(screen.queryByText(/Welcome,/)).toBeNull();
  });

  it("redirects to login and hides protected content when a dashboard request returns 401", async () => {
    mockAuthenticatedRequests();
    render(<DashboardPage />);
    expect(await screen.findByText("Welcome, Weather User")).toBeTruthy();

    apiFetch.mockRejectedValueOnce(unauthorizedError());
    fireEvent.change(screen.getByLabelText("City"), { target: { value: "Paris" } });
    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/login"));
    expect(screen.getByText("Loading dashboard...")).toBeTruthy();
    expect(screen.queryByText(/Welcome,/)).toBeNull();
  });
});
