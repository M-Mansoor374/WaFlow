export interface Contact {
  id: string;
  phone: string;
  name: string;
  email?: string;
  company?: string;
  language?: string;
  tags: string[];
  customFields: Record<string, unknown>;
  optInStatus: "opted_in" | "opted_out" | "unknown";
  createdAt: string;
  potentialDuplicates?: string[];
}
