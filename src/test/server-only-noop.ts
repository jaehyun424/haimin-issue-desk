// vitest 전용 'server-only' noop shim.
// Next.js 런타임에서는 server-only 패키지가 클라 번들에서 import 되면 빌드 에러를 낸다.
// 테스트 환경에서는 의미 없는 가드이므로 이 파일로 alias 한다.
export {};
