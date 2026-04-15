import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ElectionBanner({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <Alert variant="info" className="my-4">
      <AlertTitle>선거모드 안내</AlertTitle>
      <AlertDescription>
        현재 공직선거법상 의정활동 보고 제한 기간을 고려해 운영 중입니다. 신규 공개 브리프는
        검토자 승인 후에만 게시되며, 자동 발행은 일시 중지됩니다.
      </AlertDescription>
    </Alert>
  );
}
