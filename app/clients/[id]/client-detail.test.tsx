import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock convex/react
vi.mock("convex/react", () => {
  return {
    useQuery: vi.fn(),
        useMutation: vi.fn(),
        useConvex: vi.fn(() => ({
          mutation: vi.fn(),
                                query: vi.fn(),
        })),
  };
});

import ClientDetailPage from "@/app/clients/detail/page";
import { useQuery, useMutation } from "convex/react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
                                  useRouter: vi.fn(() => ({
                                    push: vi.fn(),
                                  })),
}));

// Mock the 'use' hook from React
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    use: (promise: Promise<any>) => {
      return (promise as any)._resolvedValue || {};
    },
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
    const paramsPromise = Promise.resolve({ id: "client1" });
    (paramsPromise as any)._resolvedValue = { id: "client1" };

    vi.mocked(useQuery).mockImplementation((_query, args) => {
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
    const paramsPromise = Promise.resolve({ id: "client1" });
    (paramsPromise as any)._resolvedValue = { id: "client1" };

    vi.mocked(useQuery).mockImplementation((_query, args) => {
      if (args && "id" in args) return mockClient;
      if (args && "clientId" in args) return mockProjects;
      if (args && "storageId" in args) return null;
      return null;
    });

    const mockCreateProject = vi.fn();
    vi.mocked(useMutation).mockReturnValue(mockCreateProject);

    render(<ClientDetailPage searchParams={paramsPromise} />);

    const addProjectButton = screen.getByRole("button", { name: /add project/i });
    fireEvent.click(addProjectButton);

    expect(await screen.findByText("Add New Project")).toBeInTheDocument();
    expect(screen.getByLabelText("Project Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Budget")).toBeInTheDocument();
  });
});
