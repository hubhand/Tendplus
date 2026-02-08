-- TEND+ Phase 1 Storage RLS 정책
-- 실행 순서: 1) schema-tendplus-v1.9.sql 2) schema-rls-phase1.sql 3) [HUMAN] Storage 버킷 생성 4) 이 파일
-- [HUMAN] product-images (public), ocr-scans (private) 버킷 생성 완료 후 실행

-- product-images (공개)
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);

-- ocr-scans (비공개, 인증된 사용자만)
CREATE POLICY "Authenticated can upload scans"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ocr-scans'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated can view scans"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'ocr-scans'
  AND auth.role() = 'authenticated'
);
