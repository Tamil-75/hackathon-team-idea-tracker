import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Landing from "./pages/public/Landing";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import StudentDashboard from "./pages/student/Dashboard";
import FindTeams from "./pages/student/FindTeams";
import CreateTeam from "./pages/student/CreateTeam";
import TeamDetails from "./pages/student/TeamDetails";
import MyTeam from "./pages/student/MyTeam";
import Ideas from "./pages/student/Ideas";
import CreateIdea from "./pages/student/CreateIdea";
import EditIdea from "./pages/student/EditIdea";
import IdeaDetails from "./pages/student/IdeaDetails";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageTeams from "./pages/admin/ManageTeams";
import ManageIdeas from "./pages/admin/ManageIdeas";

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected student routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <StudentDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teams"
        element={
          <ProtectedRoute>
            <Layout>
              <FindTeams />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teams/create"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateTeam />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teams/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <TeamDetails />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-team"
        element={
          <ProtectedRoute>
            <Layout>
              <MyTeam />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ideas"
        element={
          <ProtectedRoute>
            <Layout>
              <Ideas />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ideas/create"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateIdea />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ideas/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <IdeaDetails />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ideas/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <EditIdea />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Protected admin routes */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <Layout>
              <AdminDashboard />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <AdminRoute>
            <Layout>
              <ManageStudents />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/teams"
        element={
          <AdminRoute>
            <Layout>
              <ManageTeams />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/ideas"
        element={
          <AdminRoute>
            <Layout>
              <ManageIdeas />
            </Layout>
          </AdminRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
