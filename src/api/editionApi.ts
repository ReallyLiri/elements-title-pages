export interface AddEditionRequest {
  key?: string;
  year?: string;
  city?: string;
  language?: string;
  "author (normalized)"?: string;
  title?: string;
  title_EN?: string;
  type?: "elements" | "secondary";
  "publisher (normalized)"?: string;
  imprint?: string;
  imprint_EN?: string;
  ustc_id?: string;
  scan_url?: string;
  tp_url?: string;
  notes?: string;
}

export interface CreateEditionResponse {
  success: boolean;
  key: string;
}

export const addEdition = async (
  data: AddEditionRequest,
): Promise<CreateEditionResponse> => {
  const response = await fetch("/api/edition", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to create edition: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
};
