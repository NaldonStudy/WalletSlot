// ===== 슬롯 카테고리 관련 상수 =====
import FoodIcon from '../assets/icons/slots/식비.svg';
import TransportIcon from '../assets/icons/slots/교통.svg';
import FashionIcon from '../assets/icons/slots/잡화.svg';
import CoffeeIcon from '../assets/icons/slots/coffee.svg';
import LeisureIcon from '../assets/icons/slots/문화생활비.svg';
import HealthIcon from '../assets/icons/slots/건강.svg';
import SavingIcon from '../assets/icons/slots/저축.svg';
import CarIcon from '../assets/icons/slots/자동차비.svg';
import BeautyIcon from '../assets/icons/slots/미용.svg';
import HobbyIcon from '../assets/icons/slots/취미.svg';
import InsuranceIcon from '../assets/icons/slots/보험비.svg';
import TelecomIcon from '../assets/icons/slots/통신비.svg';
import HousingIcon from '../assets/icons/slots/주거비.svg';
import SubscriptionIcon from '../assets/icons/slots/구독비.svg';
import ChildcareIcon from '../assets/icons/slots/육아비.svg';
import GiftIcon from '../assets/icons/slots/용돈.svg';
import PetIcon from '../assets/icons/slots/반려동물.svg';
import DateIcon from '../assets/icons/slots/데이트비용.svg';
import TaxIcon from '../assets/icons/slots/세금.svg';
import EducationIcon from '../assets/icons/slots/교육비.svg';
import CeremonyIcon from '../assets/icons/slots/경조사비.svg';
import MembershipIcon from '../assets/icons/slots/회비.svg';
import DonationIcon from '../assets/icons/slots/후원.svg';
import TravelIcon from '../assets/icons/slots/숙박비.svg';

export const SLOT_CATEGORIES = {
  'ef1a8ce3-99da-11f0-8086-0e08d0f2f752': { label: '식비', icon: FoodIcon, color: '#F1A791' },
  'ef1a8e27-99da-11f0-8086-0e08d0f2f752': { label: '교통비', icon: TransportIcon, color: '#F5D690' },
  'ef1a8ea6-99da-11f0-8086-0e08d0f2f752': { label: '의류/잡화', icon: FashionIcon, color: '#B8A9E4' },
  'ef1a8f15-99da-11f0-8086-0e08d0f2f752': { label: '카페/간식', icon: CoffeeIcon, color: '#B39F60' },
  'ef1a8f65-99da-11f0-8086-0e08d0f2f752': { label: '여가비', icon: LeisureIcon, color: '#8ECF82' },
  'ef1a8fbf-99da-11f0-8086-0e08d0f2f752': { label: '의료/건강', icon: HealthIcon, color: '#00E3CD' },
  'ef1a901c-99da-11f0-8086-0e08d0f2f752': { label: '저축', icon: SavingIcon, color: '#3C8182' },
  'ef1a9076-99da-11f0-8086-0e08d0f2f752': { label: '자동차비', icon: CarIcon, color: '#D99AC0' },
  'ef1a90cf-99da-11f0-8086-0e08d0f2f752': { label: '미용', icon: BeautyIcon, color: '#E7A396' },
  'ef1a9128-99da-11f0-8086-0e08d0f2f752': { label: '취미', icon: HobbyIcon, color: '#F9F4BC' },
  'ef1a9187-99da-11f0-8086-0e08d0f2f752': { label: '보험비', icon: InsuranceIcon, color: '#88CDD5' },
  'ef1a91d7-99da-11f0-8086-0e08d0f2f752': { label: '통신비', icon: TelecomIcon, color: '#AEDAD7' },
  'ef1a923a-99da-11f0-8086-0e08d0f2f752': { label: '주거비', icon: HousingIcon, color: '#5E9DDE' },
  'ef1a928a-99da-11f0-8086-0e08d0f2f752': { label: '구독비', icon: SubscriptionIcon, color: '#F3C9E4' },
  'ef1a92df-99da-11f0-8086-0e08d0f2f752': { label: '육아비', icon: ChildcareIcon, color: '#E7AAD7' },
  'ef1a9425-99da-11f0-8086-0e08d0f2f752': { label: '용돈/선물', icon: GiftIcon, color: '#969A60' },
  'ef1a9488-99da-11f0-8086-0e08d0f2f752': { label: '반려동물', icon: PetIcon, color: '#F7A978' },
  'ef1a94e6-99da-11f0-8086-0e08d0f2f752': { label: '데이트', icon: DateIcon, color: '#F26C61' },
  'ef1a954a-99da-11f0-8086-0e08d0f2f752': { label: '세금', icon: TaxIcon, color: '#AD9291' },
  'ef1a95ab-99da-11f0-8086-0e08d0f2f752': { label: '교육비', icon: EducationIcon, color: '#98D0F5' },
  'ef1a9603-99da-11f0-8086-0e08d0f2f752': { label: '경조사', icon: CeremonyIcon, color: '#817288' },
  'ef1a9659-99da-11f0-8086-0e08d0f2f752': { label: '회비', icon: MembershipIcon, color: '#851F41' },
  'ef1a96b2-99da-11f0-8086-0e08d0f2f752': { label: '후원', icon: DonationIcon, color: '#83A061' },
  'ef1a9708-99da-11f0-8086-0e08d0f2f752': { label: '여행/숙박', icon: TravelIcon, color: '#CAD892' },
} as const;

// 미분류 슬롯 ID
export const UNCATEGORIZED_SLOT_ID = "ef1a8a1d-99da-11f0-8086-0e08d0f2f752";
