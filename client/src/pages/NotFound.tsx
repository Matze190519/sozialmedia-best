import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a]">
      <Card className="w-full max-w-lg mx-4 bg-black/60 border-amber-500/20 backdrop-blur-xl">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/10 rounded-full animate-pulse" />
              <AlertCircle className="relative h-16 w-16 text-amber-400" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-2 font-[Montserrat]">404</h1>

          <h2 className="text-xl font-semibold text-amber-400 mb-4">
            Seite nicht gefunden
          </h2>

          <p className="text-white/50 mb-8 leading-relaxed">
            Diese Seite existiert leider nicht.
            <br />
            Sie wurde möglicherweise verschoben oder gelöscht.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleGoHome}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
            >
              <Home className="w-4 h-4 mr-2" />
              Zum Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
