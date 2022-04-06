import { Counter } from "../domain/Counter";

export interface IDashboardService {
  getStats(): Promise<Counter[]>;
}
