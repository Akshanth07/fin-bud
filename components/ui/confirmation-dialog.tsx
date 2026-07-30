"use client";
import { Modal } from "./modal";
import { Button } from "./button";

export function ConfirmationDialog({
  open, onClose, onConfirm, title, description,
}: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; description: string }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-muted">{description}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={onConfirm}>Confirm</Button>
      </div>
    </Modal>
  );
}
