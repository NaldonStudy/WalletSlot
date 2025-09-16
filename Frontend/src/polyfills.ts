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

// MSW의 WebSocket 모킹이 BroadcastChannel을 사용하려고 시도합니다.
// React Native에는 이 기능이 없으므로, 충돌을 방지하기 위해 최소한의 모조(mock) 객체를 만들어줍니다.
if (typeof (global as any).BroadcastChannel === 'undefined') {
  (global as any).BroadcastChannel = class BroadcastChannel {
    constructor(name: string) {
      // 생성자만 있어도 대부분의 참조 오류를 막을 수 있습니다.
    }
    postMessage(message: any) {
      // 메서드가 호출될 때 아무 작업도 하지 않도록 비워둡니다.
    }
    close() {}
    // onmessage 속성도 null로 할당해줍니다.
    onmessage: ((event: any) => void) | null = null;
  };
}

// Minimal XMLHttpRequestUpload polyfill for MSW interceptors
if (typeof (global as any).XMLHttpRequestUpload === 'undefined') {
    (global as any).XMLHttpRequestUpload = class XMLHttpRequestUpload {
        onprogress: ((e: any) => void) | null = null;
        onload: ((e: any) => void) | null = null;
        onerror: ((e: any) => void) | null = null;
        onabort: ((e: any) => void) | null = null;
    };
}

// Ensure XMLHttpRequest.prototype.upload exists (some RN environments lack it)
try {
    if (typeof (global as any).XMLHttpRequest !== 'undefined') {
        const xhrProto = (global as any).XMLHttpRequest.prototype;
        if (!xhrProto.upload) {
            Object.defineProperty(xhrProto, 'upload', {
                configurable: true,
                enumerable: true,
                get() {
                    if (!(this as any).__upload) {
                        (this as any).__upload = new (global as any).XMLHttpRequestUpload();
                    }
                    return (this as any).__upload;
                },
                set(value: any) {
                    try {
                        // allow assigning a value to upload (some libs do xhr.upload = {} )
                        (this as any).__upload = value;
                    } catch (e) {
                        // swallow to avoid crashes; fallback to getter-created upload
                        if (!(this as any).__upload) {
                            (this as any).__upload = new (global as any).XMLHttpRequestUpload();
                        }
                    }
                }
            });
        }
    }
} catch (e) {
    // best-effort polyfill; swallow errors to avoid crashing app startup
}

// Ensure getAllResponseHeaders/getResponseHeader behave safely in RN environments
try {
    if (typeof (global as any).XMLHttpRequest !== 'undefined') {
        const xhrProto = (global as any).XMLHttpRequest.prototype;

        // Wrap existing getAllResponseHeaders to always return a string
        if (typeof xhrProto.getAllResponseHeaders === 'function') {
            const orig = xhrProto.getAllResponseHeaders;
            xhrProto.getAllResponseHeaders = function () {
                try {
                    const result = orig.call(this);
                    return result == null ? '' : result;
                } catch (e) {
                    return '';
                }
            };
        } else {
            // Define fallback
            xhrProto.getAllResponseHeaders = function () {
                return '';
            };
        }

        // Ensure getResponseHeader returns null rather than throwing
        if (typeof xhrProto.getResponseHeader !== 'function') {
            xhrProto.getResponseHeader = function (_name: string) {
                return null;
            };
        }
    }
} catch (e) {
    // swallow
}