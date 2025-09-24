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
  'c8e5d5c4-95e9-11f0-9470-3a932b1ba57c': { label: '식비', icon: FoodIcon, color: '#F1A791' },
  'c8e5fa9f-95e9-11f0-9470-3a932b1ba57c': { label: '교통비', icon: TransportIcon, color: '#F5D690' },
  'c8e5fbfe-95e9-11f0-9470-3a932b1ba57c': { label: '의류/잡화', icon: FashionIcon, color: '#B8A9E4' },
  'c8e5fc80-95e9-11f0-9470-3a932b1ba57c': { label: '카페/간식', icon: CoffeeIcon, color: '#B39F60' },
  'c8e5fcec-95e9-11f0-9470-3a932b1ba57c': { label: '여가비', icon: LeisureIcon, color: '#8ECF82' },
  'c8e5fd51-95e9-11f0-9470-3a932b1ba57c': { label: '의료/건강', icon: HealthIcon, color: '#00E3CD' },
  'c8e5fdb5-95e9-11f0-9470-3a932b1ba57c': { label: '저축', icon: SavingIcon, color: '#3C8182' },
  'c8e5fe1e-95e9-11f0-9470-3a932b1ba57c': { label: '자동차비', icon: CarIcon, color: '#D99AC0' },
  'c8e5fe88-95e9-11f0-9470-3a932b1ba57c': { label: '미용', icon: BeautyIcon, color: '#E7A396' },
  'c8e5feec-95e9-11f0-9470-3a932b1ba57c': { label: '취미', icon: HobbyIcon, color: '#F9F4BC' },
  'c8e5ff50-95e9-11f0-9470-3a932b1ba57c': { label: '보험비', icon: InsuranceIcon, color: '#88CDD5' },
  'c8e5ffb4-95e9-11f0-9470-3a932b1ba57c': { label: '통신비', icon: TelecomIcon, color: '#AEDAD7' },
  'c8e60016-95e9-11f0-9470-3a932b1ba57c': { label: '주거비', icon: HousingIcon, color: '#5E9DDE' },
  'c8e60076-95e9-11f0-9470-3a932b1ba57c': { label: '구독비', icon: SubscriptionIcon, color: '#F3C9E4' },
  'c8e600d5-95e9-11f0-9470-3a932b1ba57c': { label: '육아비', icon: ChildcareIcon, color: '#E7AAD7' },
  'c8e60135-95e9-11f0-9470-3a932b1ba57c': { label: '용돈/선물', icon: GiftIcon, color: '#969A60' },
  'c8e60198-95e9-11f0-9470-3a932b1ba57c': { label: '반려동물', icon: PetIcon, color: '#F7A978' },
  'c8e601ff-95e9-11f0-9470-3a932b1ba57c': { label: '데이트', icon: DateIcon, color: '#F26C61' },
  'c8e60260-95e9-11f0-9470-3a932b1ba57c': { label: '세금', icon: TaxIcon, color: '#AD9291' },
  'c8e602ce-95e9-11f0-9470-3a932b1ba57c': { label: '교육비', icon: EducationIcon, color: '#98D0F5' },
  'c8e60330-95e9-11f0-9470-3a932b1ba57c': { label: '경조사', icon: CeremonyIcon, color: '#817288' },
  'c8e60391-95e9-11f0-9470-3a932b1ba57c': { label: '회비', icon: MembershipIcon, color: '#851F41' },
  'c8e603f5-95e9-11f0-9470-3a932b1ba57c': { label: '후원', icon: DonationIcon, color: '#83A061' },
  'c8e6045a-95e9-11f0-9470-3a932b1ba57c': { label: '여행/숙박', icon: TravelIcon, color: '#CAD892' },
} as const;

// 미분류 슬롯 ID
export const UNCATEGORIZED_SLOT_ID = "c8e604bb-95e9-11f0-9470-3a932b1ba57c";
