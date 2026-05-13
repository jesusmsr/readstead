import { HomeContent } from '@/components/home-content';
import { ToastProvider } from '@/components/ui/toast-provider';

export default function Home() {
  return (
    <ToastProvider>
      <HomeContent />
    </ToastProvider>
  );
}
