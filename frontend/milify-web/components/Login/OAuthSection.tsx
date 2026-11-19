import { OAuthButton } from "@/shared/OAuthButton/OAuthButton";

export default function OAuthSection() {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <p className="text-center text-sm text-white/75">یا</p>
      <OAuthButton />
    </div>
  );
}
