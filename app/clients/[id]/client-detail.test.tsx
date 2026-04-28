import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ClientDetailPage from "@/app/clients/detail/page";
import { useQuery, useMutation } from "convex/react";

// Mock convex/react
vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useConvex: vi.fn(() => ({
    mutation: vi.fn(),
    query: vi.fn(),
  })),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn((key) => {
      if (key === "id") return "client1";
      return null;
    }),
  })),
}));

// Mock React's 'use' hook safely without breaking types
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    use: vi.fn((promise: any) => promise._resolvedValue || {}),
  };
});

describe("Client Detail Page", () => {
  const mockClient = {
    _id: "client1",
    name: "John Doe",
    company: "Acme Corp",
    email: "john@example.com",
    phone: "123456789",
    status: "active",
    notes: "Some notes",
    proofImageId: "img1",
    createdAt: Date.now(),
  };

  const mockProjects = [
    {
      _id: "proj1",
      clientId: "client1",
      projectName: "Project One",
      budget: 1000,
      paymentStatus: "paid",
      deliverables: [
        { item: "Video 1", done: true },
        { item: "Video 2", done: false },
      ],
      status: "in_progress",
      deadline: Date.now(),
      startDate: Date.now(),
      link: "http://example.com",
      createdBy: "system",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page with client details and projects", async () => {
    const paramsPromise = Promise.resolve({ id: "client1" }) as any;
    paramsPromise._resolvedValue = { id: "client1" };

    vi.mocked(useQuery).mockImplementation((_query: any, args: any) => {
      if (args && "id" in args) return mockClient;
      if (args && "clientId" in args) return mockProjects;
      if (args && "storageId" in args) return null;
      return null;
    });

    render(<ClientDetailPage searchParams={paramsPromise} />);

    expect(screen.getByText("Client Details")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Project One")).toBeInTheDocument();
    expect(screen.getByText(/paid/i)).toBeInTheDocument();
  });

  it("simulates the create project flow", async () => {
    const paramsPromise = Promise.resolve({ id: "client1" }) as any;
    paramsPromise._resolvedValue = { id: "client1" };

    vi.mocked(useQuery).mockImplementation((_query: any, args: any) => {
      if (args && "id" in args) return mockClient;
      if (args && "clientId" in args) return mockProjects;
      if (args && "storageId" in args) return null;
      return null;
    });

    const mockCreateProject = vi.fn();
    vi.mocked(useMutation).mockReturnValue(mockCreateProject);

    render(<ClientDetailPage searchParams={paramsPromise} />);

    const addProjectButton = screen.getByRole("button", {
      name: /add project/i,
    });
    fireEvent.click(addProjectButton);

    expect(await screen.findByText("Add New Project")).toBeInTheDocument();
    expect(screen.getByLabelText("Project Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Budget")).toBeInTheDocument();
  });
});
