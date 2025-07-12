export default function Loading() {
  return (
    <div className="flex flex-col h-screen">
      <div className="border-b px-4 py-2">
        <div className="h-6 bg-muted rounded animate-pulse"></div>
      </div>
      <div className="flex-1 p-6">
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded animate-pulse"></div>
          <div className="h-64 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
