import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Skeleton */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-24 h-6" />
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-16 h-4" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-24 h-9" />
            <Skeleton className="w-24 h-9" />
          </div>
        </div>
      </header>

      {/* Hero Section Skeleton */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Skeleton className="w-32 h-6 mx-auto mb-4" />
          <Skeleton className="w-96 h-16 mx-auto mb-6" />
          <Skeleton className="w-full max-w-3xl h-6 mx-auto mb-8" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Skeleton className="w-48 h-12" />
            <Skeleton className="w-48 h-12" />
          </div>
          <Skeleton className="w-80 h-4 mx-auto mt-4" />
        </div>
      </section>

      {/* Benefits Section Skeleton */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Skeleton className="w-96 h-10 mx-auto mb-4" />
            <Skeleton className="w-full max-w-2xl h-6 mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="w-12 h-12 rounded-lg mb-4" />
                  <Skeleton className="w-32 h-6" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-3/4 h-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section Skeleton */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Skeleton className="w-80 h-10 mx-auto mb-4" />
            <Skeleton className="w-96 h-6 mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Skeleton className="w-64 h-8 mb-6" />
              <div className="space-y-3">
                {[...Array(10)].map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="w-48 h-4" />
                  </div>
                ))}
              </div>
            </div>

            <Card className="p-8">
              <div className="space-y-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-16 h-8" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Skeleton */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Skeleton className="w-80 h-10 mx-auto mb-4" />
            <Skeleton className="w-96 h-6 mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex mb-4 gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="w-5 h-5" />
                    ))}
                  </div>
                  <div className="space-y-2 mb-4">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-3/4 h-4" />
                  </div>
                  <div>
                    <Skeleton className="w-32 h-5 mb-1" />
                    <Skeleton className="w-40 h-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section Skeleton */}
      <section className="py-20 px-4 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Skeleton className="w-80 h-10 mx-auto mb-4" />
            <Skeleton className="w-96 h-6 mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[...Array(3)].map((_, index) => (
              <Card key={index}>
                <CardHeader className="text-center">
                  <Skeleton className="w-24 h-8 mx-auto mb-2" />
                  <Skeleton className="w-32 h-10 mx-auto mb-2" />
                  <Skeleton className="w-48 h-4 mx-auto" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {[...Array(5)].map((_, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <Skeleton className="w-4 h-4 rounded-full" />
                        <Skeleton className="w-40 h-4" />
                      </div>
                    ))}
                  </div>
                  <Skeleton className="w-full h-10" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section Skeleton */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Skeleton className="w-64 h-10 mx-auto mb-4" />
            <Skeleton className="w-80 h-6 mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <Skeleton className="w-48 h-8 mb-6" />
              <div className="space-y-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div>
                      <Skeleton className="w-24 h-5 mb-1" />
                      <Skeleton className="w-32 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <Skeleton className="w-48 h-6 mb-2" />
                <Skeleton className="w-64 h-4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(4)].map((_, index) => (
                    <div key={index}>
                      <Skeleton className="w-24 h-4 mb-2" />
                      <Skeleton className="w-full h-10" />
                    </div>
                  ))}
                  <Skeleton className="w-full h-10" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer Skeleton */}
      <footer className="bg-gray-900 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index}>
                <Skeleton className="w-32 h-6 mb-4 bg-gray-700" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, linkIndex) => (
                    <Skeleton key={linkIndex} className="w-24 h-4 bg-gray-700" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
