"use client";

export default function InviteModal({
  open,
  code,
  onClose,
  onToast,
}: {
  open: boolean;
  code: string;
  onClose: () => void;
  onToast: (m: string) => void;
}) {
  return (
    <div className={`modal-overlay${open ? " active" : ""}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h3>Invite Teammates</h3>
        <p>Share this code with your team</p>
        <div className="invite-code-display">{code}</div>
        <div
          className="copy-hint"
          onClick={() => {
            navigator.clipboard.writeText(code).then(() => onToast("Copied!"));
          }}
        >
          Click to copy
        </div>
      </div>
    </div>
  );
}
