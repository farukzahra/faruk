import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
});

export type SendResumeResponse = {
  ok: boolean;
  message: string;
};

export async function sendResume(to: string): Promise<SendResumeResponse> {
  const { data } = await api.post<SendResumeResponse>("/send-resume", { to });
  return data;
}
