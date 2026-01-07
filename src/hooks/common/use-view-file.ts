import { create } from "zustand"

type FileView = {
    url: string
    name: string
    type: string
}

interface ViewFileStore {
    open: boolean
    file: FileView | null

    onOpen: (file: FileView) => void
    onClose: () => void
}

export const useViewFile = create<ViewFileStore>((set) => ({
    open: false,
    file: null,
    onOpen: (file) => set({ open: true, file }),
    onClose: () => set({ open: false, file: null }),
}))