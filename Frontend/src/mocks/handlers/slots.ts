/*
 * 슬롯 API Mock 핸들러
 * 
 * MSW가 비활성화되어 있으므로 이 파일은 사용되지 않습니다.
 * 빌드 오류 방지를 위해 빈 파일로 유지합니다.
 */

// MSW가 비활성화되어 있으므로 모든 핸들러 코드가 제거되었습니다.
// 실제 API를 사용하고 있습니다.

// 프로젝트의 다른 mock 파일들이 `slotHandlers`와 `setActualAccountBalance`
// 를 임포트하고 있으므로 최소한의 스텁을 내보냅니다. 실제 동작은
// 서버(또는 다른 mock)에서 처리되므로 여기서는 no-op(동작 안함)으로 둡니다.
export const slotHandlers: any[] = [];

export function setActualAccountBalance(_accountId: string, _balance: number): void {
	// 테스트/모킹 환경에서 계좌 잔액을 저장하는 유틸의 자리표시자입니다.
	// 현재 프로젝트에서는 MSW가 비활성화되어 있으므로 아무 동작도 수행하지 않습니다.
}