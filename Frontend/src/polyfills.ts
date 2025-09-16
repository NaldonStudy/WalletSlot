import 'fast-text-encoding';
import 'react-native-url-polyfill/auto';

// Streams (Transform/Readable/Writable) 없을 때만 주입
if (
    typeof global.TransformStream === 'undefined' ||
    typeof global.ReadableStream === 'undefined' ||
    typeof global.WritableStream === 'undefined'
) {
    require('web-streams-polyfill/polyfill');
}

// 최소 Event 계열 (WebSocket 인터셉터가 기대)

// 'name'은 string, 'impl'은 클래스이므로 any 타입을 명시합니다.
function define(name: string, impl: any) {
    // global은 타입이 복잡하므로 (global as any)로 처리합니다.
    if (typeof (global as any)[name] === 'undefined') {
        (global as any)[name] = impl;
    }
}

define('Event', class {
    // 클래스 속성들의 타입을 미리 선언해줍니다.
    type: string;
    defaultPrevented: boolean;
    target?: any; // dispatchEvent에서 할당되므로 `any` 타입의 optional 속성으로 추가

    constructor(type: string, init: any = {}) {
        this.type = type;
        this.defaultPrevented = false;
        Object.assign(this, init);
    }

    preventDefault() {
        this.defaultPrevented = true;
    }
});

// `global.Event`는 위에서 동적으로 정의되므로 (global as any)로 접근합니다.
define('MessageEvent', class extends (global as any).Event {});

define('EventTarget', class {
    // string을 키로, 함수의 Set을 값으로 갖는 객체 타입을 명시합니다.
    _l: Record<string, Set<Function>>;

    constructor() {
        this._l = {};
    }

    // 이벤트 타입 `t`와 콜백 함수 `cb`의 타입을 명시합니다.
    addEventListener(t: string, cb: Function) {
        (this._l[t] ||= new Set()).add(cb);
    }

    removeEventListener(t: string, cb: Function) {
        this._l[t]?.delete(cb);
    }

    // 이벤트 객체 `e`의 타입을 명시합니다.
    dispatchEvent(e: any): boolean {
        e.target = this;
        for (const cb of this._l[e.type] || []) {
            cb.call(this, e);
        }
        return !e.defaultPrevented;
    }
});