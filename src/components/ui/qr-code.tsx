import Image from "next/image";

interface QrCodeDisplayProps {
  payload: object;
  size?: number;
}

export default function QrCodeDisplay({ payload, size = 150 }: QrCodeDisplayProps) {
  const dataString = encodeURIComponent(JSON.stringify(payload));
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${dataString}`;

  return (
    <Image
      src={qrUrl}
      width={size}
      height={size}
      alt="QR Code"
      className="mx-auto rounded-lg"
    />
  );
}
