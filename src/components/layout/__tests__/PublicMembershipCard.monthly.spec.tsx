import { render, screen } from "@testing-library/react";
import PublicMembershipCard from "../PublicMembershipCard";

describe("monthly account state", () => {
  it("shows an exemption on the owner account without offering another request", () => {
    render(<PublicMembershipCard variant="active" groupName="Grupo Central" monthlyExempt />);
    expect(screen.getByText(/Isento de cobrança de mensalidade/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Solicitar vaga de mensalista/ })).toBeNull();
  });
});
