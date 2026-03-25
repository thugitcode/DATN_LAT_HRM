export type FileTypeMime =
  | "application/pdf"
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/vnd.ms-excel"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "text/plain"
  | "application/zip"
  | string;

export interface IStaffProfile {
  id: string,
  name: string,
  note: string,
  thumbnail: string,
  createdByName: string,
  createdAt: string,
  staffId: string,
  documentIds: string[]
}

export interface IStaffDocument {
  documentName: string,
  fileUrl: string,
  filePath: string,
  fileName: string,
  fileType: string,
  fileSize: number
  note?: string,
  updatedAt?: string,
  createdAt: string,
  deletedAt: string | null,
  id: string,
  thumbnail?: string,
  uploadedBy?: string,
  createdByName?: string,
}
export interface IPayloadStaffDocument {
  "documents": IStaffDocument[]
}