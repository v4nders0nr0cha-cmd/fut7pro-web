import { fireEvent, render, screen } from "@testing-library/react";
import AdminGuideContext from "../AdminGuideContext";
import { notifyAdminGuideChanged } from "@/lib/admin-guide-events";
const retry = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname: () => "/admin/partidas/criar-times",
  useSearchParams: () => new URLSearchParams("guia=OFFICIAL_TEAMS"),
}));
jest.mock("@/hooks/useAdminGuide", () => ({
  useAdminGuide: () => ({
    retry,
    guide: {
      tasks: [
        {
          id: "OFFICIAL_TEAMS",
          title: "Cadastre os times oficiais",
          route: "/admin/partidas/criar-times",
          applicable: true,
          canAct: true,
          completed: false,
        },
      ],
    },
  }),
}));
it("revalidates after a saved operation and removes its listener when leaving", () => {
  const timer = jest.spyOn(window, "setInterval");
  const { unmount } = render(<AdminGuideContext />);
  expect(timer).not.toHaveBeenCalled();
  notifyAdminGuideChanged();
  expect(retry).toHaveBeenCalledTimes(1);
  unmount();
  notifyAdminGuideChanged();
  expect(retry).toHaveBeenCalledTimes(1);
  timer.mockRestore();
});
it("takes the administrator to the real team creation action", () => {
  const scroll = jest.fn();
  const { getByRole } = render(
    <>
      <AdminGuideContext />
      <button
        ref={(element) => {
          if (element) {
            element.scrollIntoView = scroll;
            element.getClientRects = () => ({ length: 1 }) as DOMRectList;
          }
        }}
      >
        Novo Time
      </button>
    </>
  );
  fireEvent.click(screen.getByRole("button", { name: "Mostrar Novo Time" }));
  expect(scroll).toHaveBeenCalled();
  expect(getByRole("button", { name: "Novo Time" })).toHaveFocus();
});
