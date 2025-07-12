import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function IACronogramaLoading() {
  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center gap-2 border-b px-4 py-2">
        <Skeleton className="w-6 h-6" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="w-40 h-6" />
          <Skeleton className="w-12 h-5 rounded-full" />
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Métricas Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-4 h-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="w-16 h-8 mb-2" />
                <Skeleton className="w-32 h-3" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Análise em Tempo Real Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="w-40 h-6" />
            </div>
            <Skeleton className="w-full h-4" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="w-24 h-4" />
              </div>
              <Skeleton className="w-32 h-9" />
            </div>
          </CardContent>
        </Card>

        {/* Tabs Skeleton */}
        <div className="space-y-4">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Skeleton className="w-24 h-8" />
            <Skeleton className="w-24 h-8" />
            <Skeleton className="w-24 h-8" />
          </div>

          {/* Content Skeleton */}
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-5 h-5" />
                      <Skeleton className="w-32 h-6" />
                    </div>
                    <Skeleton className="w-20 h-5 rounded-full" />
                  </div>
                  <Skeleton className="w-48 h-4" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Skeleton className="w-24 h-5 mb-2" />
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Skeleton className="w-2 h-2 rounded-full" />
                            <Skeleton className="w-40 h-4" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Skeleton className="w-24 h-5 mb-2" />
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Skeleton className="w-3 h-3 rounded-full" />
                            <Skeleton className="w-36 h-4" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-24 h-5 rounded-full" />
                      <Skeleton className="w-20 h-4" />
                    </div>
                    <Skeleton className="w-32 h-9" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
