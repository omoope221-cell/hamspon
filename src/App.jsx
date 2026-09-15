import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminDashboardLayout from './components/layout/AdminDashboardLayout';
import PublicLayout from './components/layout/PublicLayout';
import ScrollToTop from './components/ScrollToTop';
import Preloader from './components/Preloader';

import AdminLogin from './pages/auth/AdminLogin';
import AdminForgotPassword from './pages/auth/AdminForgotPassword';
import ParentForgotPassword from './pages/auth/ParentForgotPassword';
import StaffLogin from './pages/auth/StaffLogin';
import StudentLogin from './pages/auth/StudentLogin';
import ParentLogin from './pages/auth/ParentLogin';
import Unauthorized from './pages/Unauthorized';

// Public site
import Home from './pages/public/Home';
import About from './pages/public/About';
import Leadership from './pages/public/Leadership';
import Gallery from './pages/public/Gallery';
import News from './pages/public/News';
import Events from './pages/public/Events';
import Contact from './pages/public/Contact';
import AdmissionApply from './pages/public/AdmissionApply';
import Faq from './pages/public/Faq';
import LegalPage from './pages/public/LegalPage';

// Super Admin
import AdminOverview from './pages/dashboard/superadmin/Overview';
import AdminStudents from './pages/dashboard/superadmin/Students';
import AdminStaff from './pages/dashboard/superadmin/Staff';
import AdminParents from './pages/dashboard/superadmin/Parents';
import AdminClasses from './pages/dashboard/superadmin/Classes';
import AdminResults from './pages/dashboard/superadmin/Results';
import AdminSettings from './pages/dashboard/superadmin/Settings';
import AdminWebsiteManagement from './pages/dashboard/superadmin/WebsiteManagement';
import AdminAdmissions from './pages/dashboard/superadmin/AdmissionsManagement';
import AdminAdmissionApplications from './pages/dashboard/superadmin/AdmissionApplications';
import AdminFaqManagement from './pages/dashboard/superadmin/FaqManagement';
import AdminGallery from './pages/dashboard/superadmin/Gallery';
import AdminNewsEvents from './pages/dashboard/superadmin/NewsEvents';
import AdminLeadership from './pages/dashboard/superadmin/Leadership';
import AdminNotifications from './pages/dashboard/superadmin/AdminNotifications';
import AdminPasswordManagement from './pages/dashboard/superadmin/PasswordManagement';

// Staff
import StaffOverview from './pages/dashboard/staff/Overview';
import StaffStudents from './pages/dashboard/staff/Students';
import StaffResults from './pages/dashboard/staff/Results';
import StaffEnterResults from './pages/dashboard/staff/EnterResults';
import StaffResultApprovals from './pages/dashboard/staff/ResultApprovals';
import StaffStudentFees from './pages/dashboard/staff/StudentFees';
import StaffFees from './pages/dashboard/staff/Fees';

// Student (primary & secondary share the same pages)
import StudentOverview from './pages/dashboard/student/Overview';
import StudentResults from './pages/dashboard/student/Results';
import StudentFees from './pages/dashboard/student/Fees';

import ParentHome from './pages/dashboard/parent/Home';
import ParentResults from './pages/dashboard/parent/Results';
import ParentFees from './pages/dashboard/parent/Fees';

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <BrowserRouter>
      {loading && <Preloader onDone={() => setLoading(false)} />}
      <AuthProvider>
        <SiteSettingsProvider>
        <ScrollToTop />
        <Routes>
          {/* Public marketing site */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/leadership" element={<Leadership />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/news" element={<News />} />
            <Route path="/events" element={<Events />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admissions/apply" element={<AdmissionApply />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/policies/:slug" element={<LegalPage />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
          <Route path="/parent/forgot-password" element={<ParentForgotPassword />} />
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/parent/login" element={<ParentLogin />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Super Admin — fully separate URL tree, own theme, own login */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedTypes={['super_admin']} loginPath="/admin/login">
                <AdminDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="parents" element={<AdminParents />} />
            <Route path="classes" element={<AdminClasses />} />
            <Route path="results" element={<AdminResults />} />
            <Route path="admissions" element={<AdminAdmissions />} />
            <Route path="admissions/applications" element={<AdminAdmissionApplications />} />
            <Route path="faqs" element={<AdminFaqManagement />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="news-events" element={<AdminNewsEvents />} />
            <Route path="leadership" element={<AdminLeadership />} />
            <Route path="website" element={<AdminWebsiteManagement />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="passwords" element={<AdminPasswordManagement />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Staff (all sub-roles) */}
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute allowedTypes={['staff']} loginPath="/staff/login">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StaffOverview />} />
            <Route path="students" element={<StaffStudents />} />
            <Route path="results" element={<StaffResults />} />
            <Route path="enter-results" element={<StaffEnterResults />} />
            <Route path="result-approvals" element={<StaffResultApprovals />} />
            <Route path="student-fees" element={<StaffStudentFees />} />
            <Route path="fees" element={<StaffFees />} />
          </Route>

          {/* Parents — their children's results and fees only */}
          <Route
            path="/parent/dashboard"
            element={
              <ProtectedRoute allowedTypes={['parent']} loginPath="/parent/login">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ParentHome />} />
            <Route path="results" element={<ParentResults />} />
            <Route path="fees" element={<ParentFees />} />
          </Route>

          {/* Primary & Secondary Students — results-checking portal only */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedTypes={['primary_student', 'secondary_student']} loginPath="/student/login">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentOverview />} />
            <Route path="results" element={<StudentResults />} />
            <Route path="fees" element={<StudentFees />} />
          </Route>

          {/* No custom 404 page — unknown routes redirect to the Homepage. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SiteSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
