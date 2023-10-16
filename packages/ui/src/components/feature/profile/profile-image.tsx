import { UserCircleIcon } from "../../components/core/icons";

export interface ProfileImageProps {
  image: string | undefined;
  className?: string;
}
export const ProfileImage = ({ image, className }: ProfileImageProps) => {
  return (
    <div className={className}>
      {image ? (
        <img
          alt="profile"
          className="rounded-full w-full h-full object-cover object-center shadow-lg"
          src={image}
        />
      ) : (
        <UserCircleIcon className="w-full h-full" />
      )}
    </div>
  );
};
