import Link from "next/link";
import { Button } from "../../../components/ui/button";
import Health from "../../Components/Dashboard/Health";
import StatCard from "../../Components/Dashboard/StatCard";
import RecentCases from "../../Components/Dashboard/RecentCases";
import NeedsReview from "../../Components/Dashboard/NeedsReview";
import DashboardLayout from "../../Components/Layout/DashboardLayout";

import { PlusCircle } from "lucide-react";
import { dashboardNeedsReview, dashboardRecentCases, dashboardStats } from "@/lib/mock-dashboard";
import { appRoutes } from "@/lib/mock-app";
import { CreateCaseButton } from "@/app/Components/Cases/CreateCaseButton";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                Dashboard
              </h1>
              {/* <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                PRIVATE RESEARCH
              </span> */}
            </div>
            <p className="text-slate-600 mt-2">
              Review active investigations, extraction progress, and recent output quality.
            </p>
          </div>

          <CreateCaseButton className="px-6 py-6 text-lg bg-slate-900 hover:bg-slate-800 rounded-2xl" showIcon={true} />
        </div>

        {/* Research Snapshot */}
        <div className="mb-6 w-full">
          <Health />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {dashboardStats.map((item) => (
            <StatCard key={item.label} icon={item.icon} value={item.value} label={item.label} />
          ))}
        </div>

        {/* Recent Cases & Needs Review */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Cases - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentCases cases={dashboardRecentCases} />
          </div>

          {/* Needs Review - Takes 1 column */}
          <div>
            <NeedsReview items={dashboardNeedsReview} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
