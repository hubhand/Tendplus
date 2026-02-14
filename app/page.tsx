import { DetailSection } from "@/components/detail-section"
import { PreRegistrationForm } from "@/components/pre-registration-form"

export default function Page() {
  return (
    <main className="flex flex-col items-center min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: "#0a0a0a" }}>
      {/* Section 1-3: Detail page content image - 전체 너비 */}
      <DetailSection />

      {/* Section 4: Pre-registration form - 전체 너비 */}
      <PreRegistrationForm />
    </main>
  )
}
