import { useRef, useState } from 'react'

function ResumeUpload({ file, onFileChange }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  function chooseFile(candidate) {
    if (!candidate) return
    const isPdf = candidate.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      setError('Please choose a PDF file.')
      return
    }

    setError('')
    onFileChange(candidate)
  }

  function onDrop(event) {
    event.preventDefault()
    setDragging(false)
    chooseFile(event.dataTransfer.files[0])
  }

  return (
    <div className="upload-field">
      <span className="form-label">Resume</span>
      {file ? (
        <div className="uploaded-file">
          <span className="file-icon" aria-hidden="true">
            PDF
          </span>
          <div className="uploaded-file-copy">
            <strong title={file.name}>{file.name}</strong>
            <span>{formatFileSize(file.size)}</span>
          </div>
          <button
            className="text-button"
            onClick={() => {
              onFileChange(null)
              if (inputRef.current) inputRef.current.value = ''
            }}
            type="button"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          className={`upload-dropzone${dragging ? ' upload-dropzone-active' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false)
          }}
          onDrop={onDrop}
          type="button"
        >
          <span className="upload-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 15V4m0 0L8 8m4-4 4 4M5 14v4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V14"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
              />
            </svg>
          </span>
          <span className="upload-copy">
            <strong>Drop your resume here</strong>
            <span>or <span className="upload-browse">browse files</span> · PDF only</span>
          </span>
        </button>
      )}
      <input
        accept="application/pdf,.pdf"
        className="visually-hidden"
        onChange={(event) => chooseFile(event.target.files[0])}
        ref={inputRef}
        type="file"
      />
      {error && <p className="field-error" role="alert">{error}</p>}
      <p className="field-hint">Your PDF is sent to FastAPI to create the session; it is not retained.</p>
    </div>
  )
}

function formatFileSize(size) {
  if (size < 1024) return `${size} bytes`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export default ResumeUpload
