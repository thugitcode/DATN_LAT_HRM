'use client'

import * as React from 'react'
import { Card, Button } from '@heroui/react'
import { IconAlertCircle, IconFile, IconUpload } from '@tabler/icons-react'

interface FileUploadInputProps {
  accept?: string
  maxSize?: number
  onFileSelect: (file: File | null) => void
  selectedFile?: File | null
  disabled?: boolean
  error?: string
}

export function FileUploadInput({
  accept = '.docx,.doc,.pdf,.xlsx,.xls,.csv',
  maxSize = 5 * 1024 * 1024,
  onFileSelect,
  selectedFile = null,
  disabled = false,
  error,
}: FileUploadInputProps) {
  const [dragActive, setDragActive] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      return false
    }

    const acceptedTypes = accept.split(',').map((t) => t.trim())
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()

    return acceptedTypes.includes(fileExt)
  }

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file)
    } else {
      onFileSelect(null)
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    onFileSelect(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click()
    }
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
        size={32}
        className={colorMap[ext || ''] || 'text-default-400'}
      />
    )
  }

  return (
    <div className="space-y-3 w-full">
      <Card
        isPressable={!disabled}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`cursor-pointer transition-all w-full ${
          dragActive
            ? 'bg-primary-100 border-2 border-primary'
            : 'border-2 border-dashed border-default-300'
        } ${error ? 'border-danger' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-3 flex-1">
              {getFileIcon(selectedFile.name)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-default-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            <Button
              isIconOnly
              variant="light"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
            >
              ✕
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 p-8 bg-[#f4f4f5]">
            <IconUpload size={32} className="text-primary" />
            <div className="text-center">
              <p className="font-semibold">Kéo và thả file vào đây</p>
              <p className="text-sm text-default-500">
                hoặc click để chọn file
              </p>
            </div>
            <p className="text-xs text-default-400">
              Hỗ trợ: docx, doc, pdf, xlsx, xls, csv (tối đa 5MB)
            </p>
          </div>
        )}
      </Card>

      {error && (
        <div className="flex gap-2 rounded-lg bg-danger-50 p-3">
          <IconAlertCircle size={20} className="text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}
    </div>
  )
}