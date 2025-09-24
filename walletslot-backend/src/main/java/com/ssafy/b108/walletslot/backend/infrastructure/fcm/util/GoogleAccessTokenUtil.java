package com.ssafy.b108.walletslot.backend.infrastructure.fcm.util;

import com.google.auth.oauth2.GoogleCredentials;
import com.ssafy.b108.walletslot.backend.global.error.AppException;
import com.ssafy.b108.walletslot.backend.global.error.ErrorCode;
import org.springframework.beans.factory.annotation.Value;

import java.io.FileInputStream;
import java.util.Collections;

public class GoogleAccessTokenUtil {

    // Field
    @Value("${api.ssafy.finance.apiKey}")
    private static String SERVICE_ACCOUNT_PATH;

    // Method
    public static String getAccessToken(){
        GoogleCredentials googleCredentials;
        try {
            googleCredentials = GoogleCredentials
                    .fromStream(new FileInputStream(SERVICE_ACCOUNT_PATH))
                    .createScoped(Collections.singletonList("https://www.googleapis.com/auth/firebase.messaging"));
            googleCredentials.refreshIfExpired();
        } catch(Exception e) {
            e.printStackTrace();
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "NotificationService - 000");
        }
        return googleCredentials.getAccessToken().getTokenValue();
    }
}
