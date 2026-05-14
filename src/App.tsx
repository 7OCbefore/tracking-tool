import Header from '@/components/layout/Header';
import TabBar from '@/components/layout/TabBar';
import SearchBar from '@/components/layout/SearchBar';
import PackageList from '@/components/list/PackageList';
import BatchBar from '@/components/list/BatchBar';
import FabMenu from '@/components/layout/FabMenu';

export default function App() {
  return (
    <div className="min-h-dvh bg-gray-50 pb-20">
      <Header />
      <TabBar />
      <SearchBar />
      <PackageList />
      <BatchBar />
      <FabMenu />
    </div>
  );
}
