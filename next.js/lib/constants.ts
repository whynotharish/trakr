import { Timestamp } from "firebase/firestore";

export type TagKey = "wondermart" | "merch" | "whatsapp" | "comms" | "sql" | "personal" | "qc";

export const tagKeys: TagKey[] = ["wondermart", "merch", "whatsapp", "comms", "sql", "personal", "qc"];
export const tagLabelsMap: Record<TagKey, string> = {
  wondermart: "Wondermart",
  merch: "Merch",
  whatsapp: "Whatsapp",
  comms: "Comms",
  sql: "Sql/Dashboard",
  personal: "Personal",
  qc: "QC/Aashish",
};
export const tagColors: Record<TagKey, string> = {
  wondermart: "#7C3AED",
  merch: "#E8553D",
  whatsapp: "#25D366",
  comms: "#3D7CE8",
  sql: "#6366F1",
  personal: "#F59E0B",
  qc: "#0D9488",
};
export const tagOptions: [string, string][] = [["", "Tag"], ...tagKeys.map((k) => [k, tagLabelsMap[k]] as [string, string])];
export const priorityOptions: [string, string][] = [["", "Priority"], ["p0", "P0"], ["p1", "P1"]];

export interface AccentColor {
  name: string;
  value: string;
  hover: string;
}
export const accentColors: AccentColor[] = [
  { name: "Blue", value: "#2563EB", hover: "#1D4ED8" },
  { name: "Indigo", value: "#4F46E5", hover: "#4338CA" },
  { name: "Violet", value: "#7C3AED", hover: "#6D28D9" },
  { name: "Fuchsia", value: "#C026D3", hover: "#A21CAF" },
  { name: "Rose", value: "#E11D48", hover: "#BE123C" },
  { name: "Orange", value: "#EA580C", hover: "#C2410C" },
  { name: "Amber", value: "#F59E0B", hover: "#D97706" },
  { name: "Emerald", value: "#10B981", hover: "#059669" },
  { name: "Teal", value: "#0D9488", hover: "#0F766E" },
  { name: "Cyan", value: "#0891B2", hover: "#0E7490" },
];

export interface BgPalette {
  bg: string;
  card: string;
  border: string;
  doneBg: string;
  doneTxt: string;
  inputBg: string;
  txtMuted: string;
  txt: string;
}
export interface BgTheme {
  name: string;
  swatch: string;
  light: BgPalette;
  dark: BgPalette;
}
export const bgThemes: BgTheme[] = [
  { name: "White", swatch: "#FFFFFF", light: { bg: "#F8F9FA", card: "#FFFFFF", border: "#E2E5E9", doneBg: "#F0F1F3", doneTxt: "#A0A5AD", inputBg: "#F8F9FA", txtMuted: "#6B7280", txt: "#1F2937" }, dark: { bg: "#111113", card: "#1E1E21", border: "#333338", doneBg: "#19191C", doneTxt: "#4B4B55", inputBg: "#19191C", txtMuted: "#6B6B78", txt: "#E5E5EA" } },
  { name: "Cream", swatch: "#FAF7F2", light: { bg: "#FAF7F2", card: "#FFFFFF", border: "#E8E4DE", doneBg: "#F0EDE8", doneTxt: "#B0AAA2", inputBg: "#FAF7F2", txtMuted: "#8A8580", txt: "#2C2C2C" }, dark: { bg: "#18181B", card: "#27272A", border: "#3F3F46", doneBg: "#1F1F23", doneTxt: "#52525B", inputBg: "#1F1F23", txtMuted: "#71717A", txt: "#E4E4E7" } },
  { name: "Sky", swatch: "#EFF6FF", light: { bg: "#EFF6FF", card: "#FFFFFF", border: "#DBEAFE", doneBg: "#E8F0FE", doneTxt: "#93B4DC", inputBg: "#EFF6FF", txtMuted: "#6B85A5", txt: "#1E3A5F" }, dark: { bg: "#0C1524", card: "#152238", border: "#1E3050", doneBg: "#0F1A2E", doneTxt: "#3A5070", inputBg: "#0F1A2E", txtMuted: "#6882A5", txt: "#D0DFEF" } },
  { name: "Sage", swatch: "#F0F5F0", light: { bg: "#F0F5F0", card: "#FFFFFF", border: "#D4E4D4", doneBg: "#E6EFE6", doneTxt: "#8AAD8A", inputBg: "#F0F5F0", txtMuted: "#6B8A6B", txt: "#1A3A1A" }, dark: { bg: "#0F1A12", card: "#1A2E1E", border: "#254030", doneBg: "#121E15", doneTxt: "#3A5540", inputBg: "#121E15", txtMuted: "#5A7A60", txt: "#D0E5D5" } },
  { name: "Rose", swatch: "#FFF1F2", light: { bg: "#FFF1F2", card: "#FFFFFF", border: "#FFE4E6", doneBg: "#FEECED", doneTxt: "#D4A0A5", inputBg: "#FFF1F2", txtMuted: "#9B6B70", txt: "#4A1520" }, dark: { bg: "#1A0F10", card: "#2E1A1C", border: "#4A2830", doneBg: "#1E1215", doneTxt: "#5A3540", inputBg: "#1E1215", txtMuted: "#8A5A60", txt: "#F0D5D8" } },
  { name: "Sand", swatch: "#F5F0E8", light: { bg: "#F5F0E8", card: "#FFFFFF", border: "#E5DDD0", doneBg: "#EDE6DB", doneTxt: "#B5A890", inputBg: "#F5F0E8", txtMuted: "#8A7E6A", txt: "#3A3020" }, dark: { bg: "#1A1710", card: "#2E2A20", border: "#453E30", doneBg: "#1E1B15", doneTxt: "#554E3E", inputBg: "#1E1B15", txtMuted: "#7A7260", txt: "#E8DFD0" } },
  { name: "Lavender", swatch: "#F5F3FF", light: { bg: "#F5F3FF", card: "#FFFFFF", border: "#E4E0FB", doneBg: "#EEEBFB", doneTxt: "#A9A0D4", inputBg: "#F5F3FF", txtMuted: "#7A6F9B", txt: "#2E2150" }, dark: { bg: "#131022", card: "#1F1A33", border: "#332B50", doneBg: "#171326", doneTxt: "#453D66", inputBg: "#171326", txtMuted: "#7268A0", txt: "#DED5F0" } },
  { name: "Mint", swatch: "#ECFDF5", light: { bg: "#ECFDF5", card: "#FFFFFF", border: "#D1FAE5", doneBg: "#E1F7EC", doneTxt: "#8FCBB0", inputBg: "#ECFDF5", txtMuted: "#5F8A76", txt: "#12362A" }, dark: { bg: "#0B1A14", card: "#132E22", border: "#1E4535", doneBg: "#0F211A", doneTxt: "#35564A", inputBg: "#0F211A", txtMuted: "#5A8070", txt: "#D0EDE0" } },
  { name: "Slate", swatch: "#F1F5F9", light: { bg: "#F1F5F9", card: "#FFFFFF", border: "#E2E8F0", doneBg: "#EAEEF3", doneTxt: "#A0AAB8", inputBg: "#F1F5F9", txtMuted: "#64748B", txt: "#1E293B" }, dark: { bg: "#0D1117", card: "#161B22", border: "#2A3038", doneBg: "#12161C", doneTxt: "#404853", inputBg: "#12161C", txtMuted: "#6B7685", txt: "#DDE3EA" } },
];

export const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const recurDayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
export const recurDayLabels = ["S", "M", "T", "W", "T", "F", "S"];
export const recurDayNames: Record<string, string> = { sun: "Sun", mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat" };

export interface Subtask {
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  text: string;
  description?: string | null;
  subtasks?: Subtask[] | null;
  tag?: TagKey | "" | null;
  priority?: "p0" | "p1" | "" | null;
  dueAt?: Timestamp | null;
  assignee?: string | null;
  done: boolean;
  recurDays?: string[] | null;
  createdBy?: string;
  position?: number;
  createdAt?: Timestamp | null;
}

export interface Member {
  name: string;
  avatar?: string | null;
  role: "admin" | "member";
}

export interface Team {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  personal?: boolean;
  members: Record<string, Member>;
}
