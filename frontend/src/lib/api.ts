import axios from "axios";
import type { EmailLanguage, SalaryCurrency } from "./send-resume";

export const api = axios.create({
  baseURL: "/api",
});

export type SendResumePayload = {
  to: string;
  subject: string;
  language: EmailLanguage;
  includeSalary: boolean;
  salaryAmount?: string;
  salaryCurrency?: SalaryCurrency;
};

export type SendResumeResponse = {
  ok: boolean;
  message: string;
};

export async function sendResume(payload: SendResumePayload): Promise<SendResumeResponse> {
  const { data } = await api.post<SendResumeResponse>("/send-resume", payload);
  return data;
}
