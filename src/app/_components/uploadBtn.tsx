"use client";
import { UploadButton } from "~/utils/uploadthing";
import { useRouter } from "next/navigation";

export default function UploadBtn() {
  const router = useRouter();

  return (
    <UploadButton
      endpoint="imageUploader"
      onClientUploadComplete={(res) => {
        router.refresh()
      }}
      onUploadError={(error: Error) => {
        // Do something with the error.
        alert(`ERROR! ${error.message}`);
      }}
    />
  );
}
