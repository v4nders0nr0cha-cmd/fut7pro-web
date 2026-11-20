import { fireEvent, render, screen } from "@testing-library/react";
import AvatarFut7Pro from "../AvatarFut7Pro";
import { DEFAULT_ATHLETE_AVATAR } from "@/utils/avatar";
import type { ImgHTMLAttributes } from "react";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    fill: _fill,
    priority: _priority,
    alt = "",
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => (
    <img {...props} alt={alt} />
  ),
}));
it("keeps real photos and switches to the same neutral fallback on a load error", () => {
  const callback = jest.fn();
  render(<AvatarFut7Pro src="/uploads/real.jpg" alt="Atleta" onError={callback} />);
  expect(screen.getByRole("img", { name: "Atleta" })).toHaveAttribute("src", "/uploads/real.jpg");
  fireEvent.error(screen.getByRole("img"));
  const fallback = screen.getByRole("img", { name: "Atleta (sem foto)" });
  expect(fallback).toHaveAttribute("src", DEFAULT_ATHLETE_AVATAR);
  expect(fallback).toHaveAttribute("data-avatar-placeholder", "true");
  expect(callback).toHaveBeenCalledTimes(1);
  fireEvent.error(fallback);
  expect(screen.getByRole("img")).toHaveAttribute("src", DEFAULT_ATHLETE_AVATAR);
});
it("handles a missing, removed, replaced and restored photo without carrying stale failures", () => {
  const view = render(<AvatarFut7Pro src={null} alt="Atleta" />);
  expect(screen.getByRole("img")).toHaveAttribute("src", DEFAULT_ATHLETE_AVATAR);
  view.rerender(<AvatarFut7Pro src="/uploads/one.jpg" alt="Atleta" />);
  expect(screen.getByRole("img")).toHaveAttribute("src", "/uploads/one.jpg");
  fireEvent.error(screen.getByRole("img"));
  view.rerender(<AvatarFut7Pro src="/uploads/two.jpg" alt="Atleta" />);
  expect(screen.getByRole("img")).toHaveAttribute("src", "/uploads/two.jpg");
  view.rerender(<AvatarFut7Pro src={null} alt="Atleta" />);
  expect(screen.getByRole("img")).toHaveAttribute("src", DEFAULT_ATHLETE_AVATAR);
  view.rerender(<AvatarFut7Pro src="/uploads/one.jpg" alt="Atleta" />);
  expect(screen.getByRole("img")).toHaveAttribute("src", "/uploads/one.jpg");
});
it("normalizes old fallback overrides and supports fill layouts without fixed dimensions", () => {
  const view = render(
    <AvatarFut7Pro
      src="null"
      fallbackSrc="/images/jogadores/jogador_padrao_01.jpg"
      alt="Atleta"
      fill
      sizes="48px"
    />
  );
  expect(screen.getByRole("img")).toHaveAttribute("src", DEFAULT_ATHLETE_AVATAR);
  expect(screen.getByRole("img")).not.toHaveAttribute("width");
  view.rerender(<AvatarFut7Pro src={null} alt="" size={64} />);
  expect(view.container.querySelector("img")).toHaveAttribute("alt", "");
  expect(view.container.querySelector("img")).toHaveAttribute("width", "64");
});
