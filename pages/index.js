import Header from '@/components/Header';
import DownloaderForm from '@/components/DownloaderForm';

export default function Home() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <DownloaderForm />
      </main>
    </div>
  );
}
