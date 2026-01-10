import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navigation } from './components/navigation'
import { PageErrorBoundary, SectionErrorBoundary } from './components/ui/withErrorBoundary'
import { GlobalErrorHandler, PerformanceMonitor, AccessibilityMonitor } from './components/ui/GlobalErrorHandler'
import { AppProvider, AuthProvider } from './context'
import DesignSystemDemo from './components/demo/DesignSystemDemo'
import ErrorHandlingDemo from './components/demo/ErrorHandlingDemo'
import { ApiDemo } from './components/demo/ApiDemo'
import {
  HomePage,
  AboutPage,
  ServicesPage,
  PortfolioPage,
  BookPage,
  ContactPage,
  LocationPage,
  AdminLoginPage,
  AdminDashboardPage,
  PortfolioManagementPage,
  BookingManagementPage,
  InquiryManagementPage,
  UserManagementPage,
  AnalyticsPage
} from './pages'

const year = new Date().getFullYear();

function App() {
  return (
    <PageErrorBoundary>
      <AppProvider>
        <GlobalErrorHandler>
          <PerformanceMonitor />
          <AccessibilityMonitor />
          <AuthProvider>
            <Router>
              <Routes>
                {/* Admin Routes */}
                <Route path="/admin/login" element={
                  <SectionErrorBoundary sectionName="Admin Login">
                    <AdminLoginPage />
                  </SectionErrorBoundary>
                } />
                <Route path="/admin/dashboard" element={
                  <SectionErrorBoundary sectionName="Admin Dashboard">
                    <AdminDashboardPage />
                  </SectionErrorBoundary>
                } />
                <Route path="/admin/portfolio" element={
                  <SectionErrorBoundary sectionName="Portfolio Management">
                    <PortfolioManagementPage />
                  </SectionErrorBoundary>
                } />
                <Route path="/admin/bookings" element={
                  <SectionErrorBoundary sectionName="Booking Management">
                    <BookingManagementPage />
                  </SectionErrorBoundary>
                } />
                <Route path="/admin/inquiries" element={
                  <SectionErrorBoundary sectionName="Inquiry Management">
                    <InquiryManagementPage />
                  </SectionErrorBoundary>
                } />
                <Route path="/admin/users" element={
                  <SectionErrorBoundary sectionName="User Management">
                    <UserManagementPage />
                  </SectionErrorBoundary>
                } />
                <Route path="/admin/analytics" element={
                  <SectionErrorBoundary sectionName="Analytics">
                    <AnalyticsPage />
                  </SectionErrorBoundary>
                } />
                
                {/* Public Routes */}
                <Route path="/*" element={
                  <div className="min-h-screen bg-white">
                    <SectionErrorBoundary sectionName="Navigation">
                      <Navigation />
                    </SectionErrorBoundary>
                    
                    <main className="container mx-auto py-8 px-4">
                      <Routes>
                        <Route path="/" element={
                          <SectionErrorBoundary sectionName="Home Page">
                            <HomePage />
                          </SectionErrorBoundary>
                        } />
                        <Route path="/about" element={
                          <SectionErrorBoundary sectionName="About Page">
                            <AboutPage />
                          </SectionErrorBoundary>
                        } />
                        <Route path="/services" element={
                          <SectionErrorBoundary sectionName="Services Page">
                            <ServicesPage />
                          </SectionErrorBoundary>
                        } />
                        <Route path="/services/photography" element={
                          <SectionErrorBoundary sectionName="Photography Services">
                            <ServicesPage />
                          </SectionErrorBoundary>
                        } />
                        <Route path="/services/videography" element={
                          <SectionErrorBoundary sectionName="Videography Services">
                            <ServicesPage />
                          </SectionErrorBoundary>
                        } />
                        <Route path="/services/sound" element={
                          <SectionErrorBoundary sectionName="Sound Services">
                            <ServicesPage />
                          </SectionErrorBoundary>
                        } />
                        <Route path="/portfolio" element={
                          <SectionErrorBoundary sectionName="Portfolio Page">
                            <PortfolioPage />
                          </SectionErrorBoundary>
                        } />
                        <Route path="/book" element={
                          <SectionErrorBoundary sectionName="Booking Page">
                            <BookPage />
                          </SectionErrorBoundary>
                        } />
                        <Route path="/contact" element={
                          <SectionErrorBoundary sectionName="Contact Page">
                            <ContactPage />
                          </SectionErrorBoundary>
                        } />
                        <Route path="/location" element={
                          <SectionErrorBoundary sectionName="Location Page">
                            <LocationPage />
                          </SectionErrorBoundary>
                        } />
                        <Route path="/design-system" element={
                          <SectionErrorBoundary sectionName="Design System">
                            <DesignSystemDemo />
                          </SectionErrorBoundary>
                        } />
                        <Route path="/error-handling-demo" element={
                          <SectionErrorBoundary sectionName="Error Handling Demo">
                            <ErrorHandlingDemo />
                          </SectionErrorBoundary>
                        } />
                        <Route path="/api-demo" element={
                          <SectionErrorBoundary sectionName="API Demo">
                            <ApiDemo />
                          </SectionErrorBoundary>
                        } />
                      </Routes>
                    </main>
                    
                    <SectionErrorBoundary sectionName="Footer">
                      <footer className="bg-secondary-100 text-secondary-700 p-4 mt-16">
                        <div className="container mx-auto text-center">
                          <p>&copy; {year} Derji Productions. All rights reserved.</p>
                          <div className="mt-2 space-x-4">
                            <a 
                              href="/design-system" 
                              className="text-primary-600 hover:text-primary-700 transition-colors"
                            >
                              View Design System
                            </a>
                            <span className="text-secondary-400">|</span>
                            <a 
                              href="/error-handling-demo" 
                              className="text-primary-600 hover:text-primary-700 transition-colors"
                            >
                              Error Handling Demo
                            </a>
                            <span className="text-secondary-400">|</span>
                            <a 
                              href="/api-demo" 
                              className="text-primary-600 hover:text-primary-700 transition-colors"
                            >
                              API Demo
                            </a>
                            <span className="text-secondary-400">|</span>
                            <a 
                              href="/contact" 
                              className="text-primary-600 hover:text-primary-700 transition-colors"
                            >
                              Contact Us
                            </a>
                          </div>
                        </div>
                      </footer>
                    </SectionErrorBoundary>
                  </div>
                } />
              </Routes>
            </Router>
          </AuthProvider>
        </GlobalErrorHandler>
      </AppProvider>
    </PageErrorBoundary>
  )
}

export default App