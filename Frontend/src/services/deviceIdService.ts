import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'deviceId';

/**
 * 앱에 고정된 deviceId를 가져오거나, 없으면 생성해서 AsyncStorage에 저장한다.
 */

export async function getOrCreateDeviceId(): Promise<string> {
    try {
        // AsyncStorage에서 기존 값 확인
        const existingId = await AsyncStorage.getItem(DEVICE_ID_KEY);
        if (existingId) {
            return existingId;
        }

  // 없으면 생성
        const newId = uuidv4();
        await AsyncStorage.setItem(DEVICE_ID_KEY, newId);
        return newId;
    } catch (error) {
        console.error('[DEVICE_ID] 디바이스 ID 조회 및 생성 실패:', error);
        // 에러 시 fallback(uuid 새로 생성) - 앱 강제 종료 막기 위해
        return uuidv4();
    }
}

/**
 * 이미 생성된 deviceId를 가져온다. 없으면 null 반환
 */
export async function getDeviceId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(DEVICE_ID_KEY);
    } catch (error) {
      console.error('[DEVICE_ID] 디바이스 ID 조회 실패:', error);
      return null;
    }
  }
  
  /**
   * 디버깅/재설치 시 강제로 초기화
   */
  export async function resetDeviceId(): Promise<void> {
    try {
      await AsyncStorage.removeItem(DEVICE_ID_KEY);
    } catch (error) {
      console.error('deviceId 초기화 실패:', error);
    }
  }

  /**
   * 개발/디버그용으로 deviceId를 직접 설정
   */
  export async function setDeviceId(value: string | number): Promise<void> {
    try {
      const asString = String(value);
      await AsyncStorage.setItem(DEVICE_ID_KEY, asString);
      if (__DEV__) {
        console.log('[DEVICE_ID] deviceId 강제 설정:', asString);
      }
    } catch (error) {
      console.error('deviceId 설정 실패:', error);
      throw error;
    }
  }