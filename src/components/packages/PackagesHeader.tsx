
import { formatCurrency } from '@/utils/cashtele';

interface PackagesHeaderProps {
  balance: number;
}

const PackagesHeader = ({ balance }: PackagesHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Investment Packages</h1>
        <p className="text-gray-600 mt-2">Choose from our carefully curated investment opportunities</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600">Your Balance</p>
        <p className="text-2xl font-bold text-green-600">{formatCurrency(balance)}</p>
      </div>
    </div>
  );
};

export default PackagesHeader;
