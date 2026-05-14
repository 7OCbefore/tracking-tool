import { useUIStore } from '@/stores/uiStore';
import Header from '@/components/layout/Header';
import TabBar from '@/components/layout/TabBar';
import SearchBar from '@/components/layout/SearchBar';
import PackageList from '@/components/list/PackageList';
import BatchBar from '@/components/list/BatchBar';
import FabMenu from '@/components/layout/FabMenu';
import AddForm from '@/components/add/AddForm';
import BarcodeScanner from '@/components/add/BarcodeScanner';
import PackageDetail from '@/components/detail/PackageDetail';
import Toast from '@/components/ui/Toast';

export default function App() {
  const currentScreen = useUIStore((s) => s.currentScreen);

  if (currentScreen === 'add') return <AddForm />;
  if (currentScreen === 'scan') return <BarcodeScanner />;
  if (currentScreen === 'detail') return <PackageDetail />;

  return (
    <div className="min-h-dvh bg-gray-50 pb-20">
      <Header />
      <TabBar />
      <SearchBar />
      <PackageList />
      <BatchBar />
      <FabMenu />
      <Toast />
    </div>
  );
}
