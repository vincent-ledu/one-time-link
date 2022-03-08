import { Secret } from "../domain/Secret";

export interface IDashboardService {
  getSecrets(): Promise<Secret[]>;
}
