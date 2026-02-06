/**
 * Clerk 회원가입 페이지 (한국어)
 * - ClerkProvider의 localization={koKR}로 자동 적용
 * @see https://clerk.com/docs/guides/customizing-clerk/localization
 */
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-lg',
          },
        }}
      />
    </div>
  );
}
