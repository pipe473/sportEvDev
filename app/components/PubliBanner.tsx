import Image from 'next/image';

interface PubliBannerProps {
  bannerNumber: number;
}

const PubliBanner: React.FC<PubliBannerProps> = ({ bannerNumber }) => {
  return (
    <div className="px-4 md:px-12 my-8">
      <div className="relative w-full h-[200px] md:h-[300px]">
        <Image
          src={`/images/publi-banners/PubliBanner${bannerNumber}.jpg`}
          alt="Advertisement Banner"
          fill
          className="object-cover rounded-md"
          priority
        />
      </div>
    </div>
  );
};

export default PubliBanner; 