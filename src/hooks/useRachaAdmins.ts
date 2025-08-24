import useSWR from "swr";
import type { Admin } from "@/types/racha";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useRachaAdmins(rachaId: string) {
  const { data, error, mutate } = useSWR<Admin[]>(
    rachaId ? `/api/admin/rachas/${rachaId}/admins` : null,
    fetcher,
  );

  async function addAdmin(admin: Partial<Admin>) {
    await fetch(`/api/admin/rachas/${rachaId}/admins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(admin),
    });
    mutate();
  }

  async function updateAdmin(admin: Admin) {
    await fetch(`/api/admin/rachas/${rachaId}/admins/${admin.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(admin),
    });
    mutate();
  }

  async function deleteAdmin(id: string) {
    await fetch(`/api/admin/rachas/${rachaId}/admins/${id}`, {
      method: "DELETE",
    });
    mutate();
  }

  return {
    admins: data || [],
    isLoading: !error && !data,
    isError: !!error,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    mutate,
  };
}
