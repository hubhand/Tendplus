/**
 * DrugBank API (수정 #15)
 * - Academic License 필요 (Academic use only, Commercial use 금지)
 * - 대안: FDA API, OpenFDA
 * - API 키 미설정 시 UI에서 "약물 상호작용 확인 불가 (API 키 미설정)" 표시
 */
export async function checkDrugInteraction(
  medication: string,
  ingredient: string
): Promise<{ hasInteraction: boolean; skipped: boolean }> {
  const key = process.env.DRUGBANK_API_KEY;
  if (!key) return { hasInteraction: false, skipped: true };
  // TODO: API 호출 구현
  return { hasInteraction: false, skipped: false };
}
