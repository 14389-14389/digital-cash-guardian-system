
import { usePackages } from '@/hooks/usePackages';
import PackagesHeader from '@/components/packages/PackagesHeader';
import PackageCard from '@/components/packages/PackageCard';
import PackagesLoadingState from '@/components/packages/PackagesLoadingState';
import EmptyPackagesState from '@/components/packages/EmptyPackagesState';

const Packages = () => {
  const { packages, loading, investing, balance, handleInvest } = usePackages();

  if (loading) {
    return <PackagesLoadingState />;
  }

  return (
    <div className="space-y-6">
      <PackagesHeader balance={balance} />

      {packages.length === 0 ? (
        <EmptyPackagesState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              balance={balance}
              investing={investing}
              onInvest={handleInvest}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Packages;
