export interface Tenant {
  id: string;
  name: string;
  slug: string;
  primaryColor: string;
  accentColor: string;
  logoUrl?: string;
  domain?: string;
}

export interface TenantResolveResponse {
  tenant: Tenant;
}
