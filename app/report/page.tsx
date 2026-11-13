import type { Metadata } from "next";
import BugReportForm from "@/features/bug-reports/BugReportForm";

export const metadata: Metadata = { title: "Report a bug" };

export default function ReportPage() {
  return <BugReportForm />;
}
