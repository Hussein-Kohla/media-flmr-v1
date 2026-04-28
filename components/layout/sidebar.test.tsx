import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Sidebar } from "./sidebar";
import { usePathname } from "next/navigation";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

describe("Sidebar", () => {
  it("renders all navigation links", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<Sidebar />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Calendar")).toBeInTheDocument();
    expect(screen.getByText("Clients")).toBeInTheDocument();
    expect(screen.getByText("Editing")).toBeInTheDocument();
    expect(screen.getByText("Publishing")).toBeInTheDocument();
  });

  it("highlights the active route", () => {
    // Set current path to /calendar
    vi.mocked(usePathname).mockReturnValue("/calendar");
    render(<Sidebar />);

    const calendarLink = screen.getByText("Calendar").closest("a");
    const dashboardLink = screen.getByText("Dashboard").closest("a");

    expect(calendarLink).toHaveClass("bg-primary");
    expect(dashboardLink).not.toHaveClass("bg-primary");
  });

  it("renders user profile information", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<Sidebar />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("has the correct branding", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<Sidebar />);

    expect(screen.getByText("MediaFLMR")).toBeInTheDocument();
  });
});
