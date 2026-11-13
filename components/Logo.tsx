import Image from "next/image";

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export default function Logo({ size = 32, showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/logo.jpg"
        alt="Zoom Vault logo"
        width={size}
        height={size}
        priority
        className="rounded-md object-contain"
      />
      {showText && (
        <span className="text-lg font-semibold text-white">
          Zoom <span className="text-[#3BCCA3]">Vault</span>
        </span>
      )}
    </div>
  );
}