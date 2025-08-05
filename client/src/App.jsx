import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import LandingPage from "./pages/LandingPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import ClientMilestones from "./pages/ClientMilestones";
import DevMilestones from "./pages/DevMilestones";
import QAPage from "./pages/QAPage";
import QARevision from "./pages/QARevision";
import Deliveries from "./pages/Deliveries";
import UserProfile from "./pages/UserProfile";
import axios from "axios";
import Attendance from "./pages/Attendance";
import RedZone from "./pages/RedZone";
import Kpi from "./pages/Kpi";
import Performance from "./pages/Performance";
import FeedBack from "./pages/FeedBack";
import FinanceManagement from "./pages/Finance";
import PersonalTodoReminder from "./pages/ToDo";
import DonationCharitySystem from "./pages/Donation";
import { SuperAdminRoute } from "./secure/SuperAdminRoute";
import { ProtectClientMiles } from "./secure/ProtectClientMiles";
import { RequireApproval } from "./secure/RequireApproval";
import WaitForApproval from "./pages/WaitForApproval";
import PendingApprovals from "./pages/PendingApprovals";
import { RequirePendingApproval } from "./secure/RequirePendingApproval";

function App() {
  const { isSignedIn, getToken } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        <Routes>
          <Route
            path="/verify"
            element={
              <RequirePendingApproval>
                <WaitForApproval />
              </RequirePendingApproval>
            }
          />
          <Route element={<RequireApproval />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="client-milestones" element={
                <ProtectClientMiles>
                  <ClientMilestones />
                </ProtectClientMiles>
              } />
              <Route path="dev-milestones" element={<DevMilestones />} />
              <Route path="qa" element={<QAPage />} />
              <Route path="qa-revision" element={<QARevision />} />
              <Route path="deliveries" element={<Deliveries />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="red-zone" element={<RedZone />} />
              <Route path="kpi" element={<Kpi />} />
              <Route path="anonymous-feedback" element={<FeedBack />} />
              <Route path="finance" element={
                <SuperAdminRoute>
                  <FinanceManagement />
                </SuperAdminRoute>
              } />
              <Route
                path="pending"
                element={
                  <SuperAdminRoute>
                    <PendingApprovals />
                  </SuperAdminRoute>
                }
              />
              <Route
                path="personal-donation"
                element={<DonationCharitySystem />}
              />
              <Route
                path="personal-to-do-reminder"
                element={<PersonalTodoReminder />}
              />
              <Route path="performance" element={<Performance />} />
              <Route path="profile" element={<UserProfile />} />
            </Route>
          </Route>
        </Routes>
      </SignedIn>
    </div>
  );
}

export default App;
