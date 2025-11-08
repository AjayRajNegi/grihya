import { api } from "./api";

export type CreatePropertyInput = {
  title: string;
  description: string;
  type: "pg" | "flat" | "house" | "commercial" | "land";
  for: "rent" | "sale";
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  furnishing?: "furnished" | "semifurnished" | "unfurnished" | "";
  amenities?: string[];
  images?: string[];
};

export async function createProperty(payload: CreatePropertyInput) {
  const { data } = await api.post("/properties", payload);
  return data;
}

export async function listProperties(
  params?: Record<string, string | number | undefined>
) {
  const { data } = await api.get("/properties", { params });
  return data; // Laravel paginate() response
}

export async function getProperty(id: string | number) {
  const { data } = await api.get(`/properties/${id}`);
  return data;
}
