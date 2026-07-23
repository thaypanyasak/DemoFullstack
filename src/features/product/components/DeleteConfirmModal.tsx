interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm }: Props) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="p-6 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-base font-bold">ຢືນຢັນລຶບສິນຄ້າ?</h3>
          <p className="text-sm text-muted-foreground">
            ການດໍາເນີນການນີ້ບໍ່ສາມາດຍົກເລີກໄດ້. ຂໍ້ມູນຈະຖືກລຶບຖາວອນ.
          </p>
        </div>
        <div className="flex justify-center gap-3 border-t p-4">
          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2 text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
          >
            ຍົກເລີກ
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors cursor-pointer"
          >
            ຢືນຢັນລຶບ
          </button>
        </div>
      </div>
    </div>
  );
}
