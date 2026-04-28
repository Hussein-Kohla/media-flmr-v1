import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockUseQuery, mockUseMutation } from "@/tests/mocks/convex";
import ClientsPage from "@/app/clients/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
                                  useRouter: vi.fn(() => ({
                                    push: vi.fn(),
                                  })),
}));

describe("Clients List Page", () => {
  const mockClients = [
    {
      _id: "client1",
      name: "mohamed",
      company: "Acme Corp",
      email: "john@example.com",
      phone: "123456789",
      status: "active",
      notes: "Some notes",
      proofImageId: "img1",
      createdAt: Date.now(),
    },
    {
      _id: "client2",
      name: "Jane Smith",
      company: "Globex",
      email: "jane@example.com",
      phone: "987654321",
      status: "paused",
      notes: "Other notes",
      proofImageId: "img2",
      createdAt: Date.now(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the client list correctly", async () => {
    mockUseQuery.mockReturnValue(mockClients);

    render(<ClientsPage />);

    expect(screen.getByText("Clients")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Globex")).toBeInTheDocument();
  });

  it("opens the create client modal", async () => {
    mockUseQuery.mockReturnValue(mockClients);

    render(<ClientsPage />);

    const addButton = screen.getByRole("button", { name: /new client/i });
    fireEvent.click(addButton);

    expect(screen.getByText("Create New Client")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
  });

  it("simulates the create client flow", async () => {
    mockUseQuery.mockReturnValue(mockClients);
    const mockCreateClient = vi.fn();
    mockUseMutation.mockImplementation(() => mockCreateClient);

    render(<ClientsPage />);

    const addButton = screen.getByRole("button", { name: /new client/i });
    fireEvent.click(addButton);

    fireEvent.change(screen.getByPlaceholderText("John Doe"), { target: { value: "New Client" } });
    fireEvent.change(screen.getByPlaceholderText("Acme Inc."), { target: { value: "New Company" } });

    const submitButton = screen.getByRole("button", { name: /create client/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateClient).toHaveBeenCalledWith(expect.objectContaining({
        name: "New Client",
        company: "New Company",
      }));
    });
  });

  it("filters clients by status", async () => {
    mockUseQuery.mockReturnValue(mockClients);

    render(<ClientsPage />);

    const statusFilter = screen.getByRole("combobox");
    fireEvent.change(statusFilter, { target: { value: "active" } });

    const statusCall = mockUseQuery.mock.calls.find(([, args]) => args?.status === "active");
    expect(statusCall?.[1]).toEqual(expect.objectContaining({
      status: "active",
    }));
  });
});
