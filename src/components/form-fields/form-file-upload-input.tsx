'use client'

import * as React from 'react'
import { Card, Button, CardBody } from '@heroui/react'
import { IconAlertCircle, IconFile, IconUpload } from '@tabler/icons-react'
import { useViewFile } from '@/hooks/common/use-view-file'

interface FileUploadInputProps {
  accept?: string
  maxSize?: number
  multiple?: boolean
  onFilesSelect: (files: any[]) => void
  selectedFiles?: any[]
  disabled?: boolean
  error?: string
}

export function FileUploadInput({
  accept = '.docx,.doc,.pdf,.xlsx,.xls,.csv',
  maxSize = 5 * 1024 * 1024,
  multiple = true,
  onFilesSelect,
  selectedFiles = [],
  disabled = false,
  error,
}: FileUploadInputProps) {
  const [dragActive, setDragActive] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const { onOpen } = useViewFile()
  const validateFile = (file: File) => {
    if (file.size > maxSize) return false

    const acceptedTypes = accept.split(',').map((t) => t.trim())
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()

    return acceptedTypes.includes(fileExt)
  }

  const handleFiles = (fileList: FileList) => {
    const filesArray = Array.from(fileList)
    const validFiles = filesArray.filter(validateFile)

    if (multiple) {
      onFilesSelect([...(selectedFiles || []), ...validFiles])
    } else {
      onFilesSelect(validFiles.slice(0, 1))
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (disabled) return

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const handleRemove = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = selectedFiles.filter((_, i) => i !== index)
    onFilesSelect(updated)
  }

  const handleClick = () => {
    if (!disabled) inputRef.current?.click()
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    const colorMap: Record<string, string> = {
      pdf: 'text-red-500',
      xlsx: 'text-green-500',
      xls: 'text-green-500',
      csv: 'text-blue-500',
      doc: 'text-blue-600',
      docx: 'text-blue-600',
    }

    return (
      <IconFile
        size={24}
        className={colorMap[ext || ''] || 'text-default-400'}
      />
    )
  }

  return (
    <div className="space-y-3 w-full">
      <Card
        isPressable={!disabled}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`cursor-pointer transition-all w-full ${dragActive
          ? 'bg-primary-100 border-2 border-primary'
          : 'border-2 border-dashed border-default-300'
          } ${error ? 'border-danger' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-3 p-6 bg-[#f4f4f5]">
          <IconUpload size={28} className="text-primary" />
          <p className="text-sm text-center">
            Kéo & thả hoặc click để chọn file
          </p>
          <p className="text-xs text-default-400">
            Hỗ trợ: docx, doc, pdf, xlsx, xls, csv (tối đa 5MB/file)
          </p>
        </div>
      </Card>

      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {selectedFiles.map((file, index) => (
            <Card
              key={index}
              isBlurred
              className="border-none bg-background/60 dark:bg-default-100/50"
              shadow="sm"
            >
              <CardBody>
                <div
                  className="flex items-center justify-between rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(file.name)}
                    <div className="min-w-0">
                      <p className="text-sm truncate hover:text-blue-600 hover:underline hover:cursor-pointer" onClick={() => {
                        const fileUrl = (file as any).url || (file instanceof Blob ? URL.createObjectURL(file) : "");
                        onOpen({
                          name: file?.name,
                          url: fileUrl,
                          type: file.type,
                        })
                      }}>{file.name}</p>
                      <p className="text-xs text-default-500">
                        {file.size ? (file.size / 1024 / 1024).toFixed(2) : "0.00"} MB
                      </p>
                    </div>
                  </div>

                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onClick={(e) => handleRemove(index, e)}
                  >
                    ✕
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <div className="flex gap-2 rounded-lg bg-danger-50 p-3">
          <IconAlertCircle size={18} className="text-danger shrink-0" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}
    </div>
  )
}