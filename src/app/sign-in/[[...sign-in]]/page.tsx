/**
 * Clerk 로그인 페이지 (한국어)
 * - ClerkProvider의 localization={koKR}로 자동 적용
 * @see https://clerk.com/docs/guides/customizing-clerk/localization
 */
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
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
