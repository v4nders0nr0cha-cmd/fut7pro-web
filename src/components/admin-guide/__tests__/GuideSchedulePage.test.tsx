import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SchedulePage from "@/app/(admin)/admin/rachas/page";

const createAgenda = jest.fn();
const removeAgenda = jest.fn();
let items: unknown[] = [];
jest.mock("@/hooks/useRachaAgenda", () => ({
  useRachaAgenda: () => ({
    items,
    isLoading: false,
    isError: false,
    isSuccess: false,
    createAgenda,
    removeAgenda,
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  items = [];
});

it("requires a valid time and preserves the existing weekday/time payload", async () => {
  createAgenda.mockResolvedValue({ id: "saved" });
  render(<SchedulePage />);
  const button = screen.getByRole("button", { name: "Adicionar" });
  expect(button).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Dia da semana"), { target: { value: "4" } });
  fireEvent.change(screen.getByLabelText("Horário"), { target: { value: "19:30" } });
  expect(button).toBeEnabled();
  fireEvent.click(button);
  await waitFor(() => expect(createAgenda).toHaveBeenCalledWith({ weekday: 4, time: "19:30" }));
  await waitFor(() => expect(screen.getByLabelText("Horário")).toHaveValue(""));
});

it("keeps an unsaved time available for correction after a failed save", async () => {
  createAgenda.mockResolvedValue(undefined);
  render(<SchedulePage />);
  fireEvent.change(screen.getByLabelText("Horário"), { target: { value: "06:00" } });
  fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));
  await waitFor(() => expect(createAgenda).toHaveBeenCalled());
  expect(screen.getByLabelText("Horário")).toHaveValue("06:00");
});

it("shows server-provided holiday and next meeting data in the mobile card", async () => {
  items = [
    {
      id: "slot",
      weekday: 4,
      time: "19:30",
      nextDate: "2026-11-19",
      holiday: true,
      holidayName: "Feriado local",
    },
  ];
  render(<SchedulePage />);
  expect(screen.getByRole("heading", { name: "Quinta-feira · 19:30" })).toBeInTheDocument();
  expect(screen.getByText("Próximo encontro · Qui 19/11/26")).toBeInTheDocument();
  expect(screen.getAllByText("Feriado local")).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "Remover Quinta-feira às 19:30" }));
  await waitFor(() => expect(removeAgenda).toHaveBeenCalledWith("slot"));
});
