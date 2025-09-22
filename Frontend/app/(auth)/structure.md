app/(auth)/
├── _layout.tsx
├── (signup)/
│   ├── _layout.tsx
│   ├── name.tsx
│   ├── resident-id.tsx
│   ├── phone.tsx
|   ├── terms-detail.tsx    
│   ├── phone-verification.tsx
│   ├── account-selection.tsx
│   ├── account-verification.tsx
|   ├── password-setup.tsx
│   ├── notification-consent.tsx 
│   └── welcome.tsx
├── (login)/
│   ├── _layout.tsx
│   ├── index.tsx              # 로그인 메인
│   └── forgot-password.tsx
├── (settings)/
│   ├── _layout.tsx
│   ├── change-password.tsx
│   └── notification-settings.tsx
└── (alarm-permission)/
    ├── _layout.tsx
    ├── notification-consent.tsx
    └── complete.tsx