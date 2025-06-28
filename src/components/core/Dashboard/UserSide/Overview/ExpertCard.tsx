import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Expert } from '@/types/types';

interface ExpertCardProps extends Expert {
  showFavoriteText?: boolean;
  imageUrl?: string;
}

const ExpertCard: React.FC<ExpertCardProps> = ({
  id,
  name,
  specialty,
  experience,
  rating,
  description,
  isFavorite = false,
  showFavoriteText = false,
  imageUrl = 'https://randomuser.me/api/portraits/women/44.jpg',
}) => {
  const router = useRouter();

  const handleBookNow = () => {
    router.push(`/dashboard/doctors/${id}`);
  };

  return (
    <div
      className={`border rounded-lg px-6 py-8 flex flex-col gap-2  shadow-md relative min-w-[280px] ${
        showFavoriteText ? 'min-h-[412px]' : 'min-h-[350px]'
      }`}
    >
      {showFavoriteText && (
        <h3 className="text-lg font-semibold mb-6">
          Your <span className="text-primary">Favorites</span>
        </h3>
      )}
      <div className="flex items-center gap-3">
        <div className="flex gap-2">
          <Avatar className="w-12 h-12 rounded-full overflow-hidden">
            <AvatarImage src={imageUrl} className="w-full h-full object-cover" />
          </Avatar>
          <div className="flex flex-col justify-center gap-2">
            <div className="font-inter font-semibold text-base16">{name}</div>
            <div className="font-inter font-medium text-base14 text-[#525252]">{specialty}</div>
            <div className="font-inter font-medium text-base14  text-[#525252]">{experience}</div>
            <div className="flex items-center gap-0.5 mt-1 text-[20px]">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>
        <button
          className={`absolute top-3 right-5 text-xl ${
            isFavorite ? 'text-[#FF2D87]' : 'text-gray-300'
          }`}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>
      <div className="text-sm text-[#525252] mt-2 mb-3">{description}</div>
      <div className="flex gap-2 mt-4">
        <Button variant="outline" className="flex-1 bg-gray-100 text-black hover:bg-gray-200">
          View Profile
        </Button>
        <Button
          className="flex-1 bg-[#00684A] text-white border-[#00684A] hover:bg-[#00684A]/90"
          onClick={handleBookNow}
        >
          Book Now
        </Button>
      </div>
    </div>
  );
};

export default ExpertCard;
