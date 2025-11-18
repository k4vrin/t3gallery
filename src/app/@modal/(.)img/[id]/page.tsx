import { Modal } from "~/app/@modal/(.)img/[id]/modal";
import FullPageImageView from "~/components/full-image-page";

export default async function PhotoModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: photoId } = await params;
  const idAsNumber = Number(photoId);
  if (isNaN(idAsNumber)) {
    return <div>Invalid photo ID</div>;
  }
  return (
    <Modal>
      <FullPageImageView id={idAsNumber} layout="modal" />
    </Modal>
  )
}
