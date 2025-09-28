import { apiClient } from './client';

export interface OCRItem {
  name: string;
  quantity: number;
  price: number;
}

export interface OCRReceiptResponse {
  storeName: string;
  date: string;
  time: string;
  items: OCRItem[];
}

export const ocrApi = {
  /**
   * 영수증 OCR 처리
   * @param imageUri - 영수증 이미지 URI
   * @param deviceId - 디바이스 식별자
   * @returns OCR 처리 결과
   */
  processReceipt: async (imageUri: string, deviceId: string): Promise<OCRReceiptResponse> => {
    try {
      console.log('[OCR API] 영수증 OCR 처리 시작:', { imageUri, deviceId });

      // FormData 생성
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      } as any);

      // API 호출
      console.log('[OCR API] API 호출 시작:', {
        url: '/api/ocr/receipt',
        deviceId,
        imageUri: imageUri.substring(0, 50) + '...'
      });

      const response = await apiClient.post('/api/ocr/receipt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Device-Id': deviceId,
        },
      });

      console.log('[OCR API] API 응답 수신 완료');

      const ocrData = response.data as OCRReceiptResponse;
      console.log('[OCR API] 영수증 OCR 처리 성공:', {
        storeName: ocrData.storeName,
        date: ocrData.date,
        time: ocrData.time,
        itemsCount: ocrData.items?.length || 0,
        items: ocrData.items?.map((item: OCRItem) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })) || []
      });

      return response.data as OCRReceiptResponse;
    } catch (error) {
      console.error('[OCR API] 영수증 OCR 처리 실패:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },
};
