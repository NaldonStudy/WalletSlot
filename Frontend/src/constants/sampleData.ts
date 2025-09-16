import { AccountData } from '@/src/types';
import { SLOT_CATEGORIES } from './slots';

export const SAMPLE_ACCOUNTS: AccountData[] = [
    {
      bankCode: '004',
      accountName: '주거래계좌',
      accountNumber: '1234-56-789012',
      balanceFormatted: '3,022,566원',
      slots: [
        {
          slotId: '01',
          name: SLOT_CATEGORIES['01'].label,
          budget: 500000,
          remain: 120000,
          color: SLOT_CATEGORIES['01'].color,
        },
        {
          slotId: '02',
          name: SLOT_CATEGORIES['02'].label,
          budget: 150000,
          remain: 80000,
          color: SLOT_CATEGORIES['02'].color,
        },
        {
          slotId: '04',
          name: SLOT_CATEGORIES['04'].label,
          budget: 100000,
          remain: 20000,
          color: SLOT_CATEGORIES['04'].color,
        },
        {
          slotId: '05',
          name: SLOT_CATEGORIES['05'].label,
          budget: 200000,
          remain: 140000,
          color: SLOT_CATEGORIES['05'].color,
        },
        {
          slotId: '07',
          name: SLOT_CATEGORIES['07'].label,
          budget: 400000,
          remain: 400000,
          color: SLOT_CATEGORIES['07'].color,
        },
      ],
    },
    {
      bankCode: '088',
      accountName: '저축계좌',
      accountNumber: '5678-12-345678',
      balanceFormatted: '5,480,200원',
      slots: [
        {
          slotId: '07',
          name: SLOT_CATEGORIES['07'].label,
          budget: 1000000,
          remain: 950000,
          color: SLOT_CATEGORIES['07'].color,
        },
        {
          slotId: '01',
          name: SLOT_CATEGORIES['01'].label,
          budget: 300000,
          remain: 200000,
          color: SLOT_CATEGORIES['01'].color,
        },
        {
          slotId: '02',
          name: SLOT_CATEGORIES['02'].label,
          budget: 120000,
          remain: 60000,
          color: SLOT_CATEGORIES['02'].color,
        },
      ],
    },
    {
      bankCode: '020',
      accountName: '급여계좌',
      accountNumber: '9012-34-567890',
      balanceFormatted: '2,140,500원',
      slots: [
        {
          slotId: '01',
          name: SLOT_CATEGORIES['01'].label,
          budget: 400000,
          remain: 50000,
          color: SLOT_CATEGORIES['01'].color,
        },
        {
          slotId: '02',
          name: SLOT_CATEGORIES['02'].label,
          budget: 200000,
          remain: 50000,
          color: SLOT_CATEGORIES['02'].color,
        },
        {
          slotId: '05',
          name: SLOT_CATEGORIES['05'].label,
          budget: 150000,
          remain: 70000,
          color: SLOT_CATEGORIES['05'].color,
        },
      ],
    },
  ];
  