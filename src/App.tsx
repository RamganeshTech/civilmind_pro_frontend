import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/login_pages/LoginPage'
import { BrowserRouter as Router } from 'react-router-dom'
import ForgotPassword from './pages/login_pages/ForgotPassword'
import ResetPassword from './pages/login_pages/ResetPassword'
import { ToastContainer } from './components/ui/toast/ToastContainer'
import ProjectMain from './pages/projects/ProjectMain'
import RegisterOrganization from './pages/organization/RegisterOrganization'
import { useAuthCheck } from './hooks/useAuthCheck'
import { ProtectedRoute } from './components/shared/ProtectedRoute'
import { MANAGEMENT_ONLY } from './constants/constants'
import { AppLayout } from './layout/AppLayout'
import { OrganizationSettings } from './pages/organization/OrganizationSettings'
import RateConfigurationMaterialMain from './pages/materialRate_pages/materialRateCategory/RateConfigurationMaterialMain'
import { RateConfigurationItemsMain } from './pages/materialRate_pages/materialRateItems_pages/RateConfigurationItemsMain'
import { RateConfigBackupMaterialCategoryMain } from './pages/materialRate_pages/materialRateCategory/backup/RateConfigBackupMaterialCategoryMain'
import { RateConfigBackupItemsMain } from './pages/materialRate_pages/materialRateItems_pages/backups/RateConfigBackupItemsMain'

const App = () => {
  const { isLoading } = useAuthCheck();

  // Show a clean loading screen while verifying the session
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-page">
        <div className="flex flex-col items-center gap-4">
          {/* Using a Lucide-react spinner or FontAwesome */}
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted text-sm font-medium tracking-wide">
            Verifying Session...
          </p>
        </div>
      </div>
    );
  }


  return (
    <>
      <Router >
        <Routes>
          <Route path="/" element={<Navigate to={'/layout'} replace={true} />} />
          <Route path="/register-organization" element={<RegisterOrganization />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:id/:token" element={<ResetPassword />} />

          <Route path='/layout' element={<AppLayout />}>

            <Route element={<ProtectedRoute allowedRoles={MANAGEMENT_ONLY} />}>
              <Route index path="projects" element={<ProjectMain />} />
              <Route path="organization" element={<OrganizationSettings />} />
              <Route path="rate-configuration" element={<RateConfigurationMaterialMain />} >
                <Route path="single/:categoryId" element={<RateConfigurationItemsMain />} >
                  <Route path="backup" element={<RateConfigBackupItemsMain />} />
                </Route>
              </Route>
              <Route path="rate-configuration-backup" element={<RateConfigBackupMaterialCategoryMain />} />
            </Route>
          </Route>


          <Route path="*" element={<div>page not found</div>} />
        </Routes>


        <ToastContainer />
      </Router>
    </>
  )
}

export default App