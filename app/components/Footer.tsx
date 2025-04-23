import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="w-full bg-black py-6 px-4">
      <div className="container mx-auto flex flex-col items-center justify-center gap-4">
        <Image
          src="/images/sportEv-red-logo.png"
          alt="SportEv Logo"
          width={120}
          height={40}
          className="object-contain"
        />
        <p className="text-gray-400 text-sm">
          © 2025 SportEv. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer; 