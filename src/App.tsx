import { Route, Routes } from "react-router-dom"
import TabBar from "@/components/TabBar"
import HomePage from "@/pages/HomePage"
import SchedulePage from "@/pages/SchedulePage"
import ClassDetailPage from "@/pages/ClassDetailPage"
import LessonDetailPage from "@/pages/LessonDetailPage"
import ReschedulePickerPage from "@/pages/ReschedulePickerPage"
import RescheduleReasonPage from "@/pages/RescheduleReasonPage"
import RescheduleReviewPage from "@/pages/RescheduleReviewPage"
import RescheduleConfirmedPage from "@/pages/RescheduleConfirmedPage"
import RescheduleDetailPage from "@/pages/RescheduleDetailPage"
import InboxPage from "@/pages/InboxPage"
import InvoiceDetailPage from "@/pages/InvoiceDetailPage"
import PaymentsPage from "@/pages/PaymentsPage"
import ProfilePage from "@/pages/ProfilePage"

export default function App() {
  return (
    <div className="flex min-h-screen justify-center">
      <div className="flex h-screen w-full max-w-[430px] flex-col bg-background shadow-sm">
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route
              path="/schedule/lesson/:classId"
              element={<LessonDetailPage />}
            />
            <Route
              path="/schedule/lesson/:classId/reschedule"
              element={<ReschedulePickerPage />}
            />
            <Route
              path="/schedule/lesson/:classId/reschedule/reason"
              element={<RescheduleReasonPage />}
            />
            <Route
              path="/schedule/lesson/:classId/reschedule/review"
              element={<RescheduleReviewPage />}
            />
            <Route
              path="/schedule/lesson/:classId/reschedule/confirmed"
              element={<RescheduleConfirmedPage />}
            />
            <Route
              path="/schedule/reschedule/:requestId"
              element={<RescheduleDetailPage />}
            />
            <Route
              path="/schedule/class/:centreId/:classCode"
              element={<ClassDetailPage />}
            />
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route
              path="/payments/:invoiceId"
              element={<InvoiceDetailPage />}
            />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
        <TabBar />
      </div>
    </div>
  )
}
