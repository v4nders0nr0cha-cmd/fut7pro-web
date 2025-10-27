import { render, screen } from "@testing-library/react";
import { PageLoading } from "@/components/ui/LoadingSpinner";

describe("LoadingStates", () => {
  it("renderiza um indicador de loading da página", () => {
    render(PageLoading());
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });
});
