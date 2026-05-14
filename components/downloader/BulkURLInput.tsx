"use client"

interface BulkURLInputProps {
  value: string
  onChange: (value: string) => void
  onDetect: () => void
  isLoading: boolean
  loadingMessage?: string | null
  submitLabel?: string
}

export function BulkURLInput({
  value,
  onChange,
  onDetect,
  isLoading,
  loadingMessage,
  submitLabel = "Detect All & Add to Queue",
}: BulkURLInputProps) {
  return (
    <div className="space-y-3">
      <textarea
        placeholder={"Paste multiple URLs here, one per line...\nhttps://youtube.com/watch?v=...\nhttps://tiktok.com/...\nhttps://instagram.com/..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        className="w-full rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] shadow-sm placeholder:text-zinc-500 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
      />
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-zinc-400">Add up to 10 URLs at once</p>
        <button
          onClick={onDetect}
          disabled={!value.trim() || isLoading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 font-medium text-white shadow-sm shadow-indigo-500/20 transition-all hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] sm:w-auto"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {loadingMessage ? "Waking up..." : "Detecting..."}
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
      {loadingMessage && <p className="text-sm text-indigo-300">{loadingMessage}</p>}
    </div>
  )
}
