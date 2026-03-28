import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import {
  Package, Search, RefreshCw, Copy, Download, Eye,
  ShoppingBag, Sparkles, Leaf, Heart, Droplets, Star,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Aloe Vera": Leaf,
  "Körperpflege": Droplets,
  "Nahrungsergänzung": Heart,
  "ZEITGARD": Sparkles,
  "Parfum": Star,
  "LR LIFETAKT": Heart,
  "Body Mission": ShoppingBag,
  "Health Mission": Heart,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Aloe Vera": "bg-green-500/10 text-green-400 border-green-500/20",
  "Körperpflege": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Nahrungsergänzung": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "ZEITGARD": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Parfum": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "LR LIFETAKT": "bg-red-500/10 text-red-400 border-red-500/20",
  "Body Mission": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Health Mission": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function ProductsPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewProduct, setPreviewProduct] = useState<any>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const { data: categories } = trpc.products.categories.useQuery();
  const { data: totalCount } = trpc.products.count.useQuery(
    selectedCategory ? { category: selectedCategory } : undefined
  );
  const { data: products, isLoading, refetch } = trpc.products.list.useQuery({
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const importMutation = trpc.products.import.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.imported} Produkte importiert!`);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCopyImage = async (imageUrl: string, name: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      toast.success(`Bild-URL von "${name}" kopiert!`);
    } catch {
      toast.error("Kopieren fehlgeschlagen");
    }
  };

  const handleCopyWhatsApp = async (text: string, name: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`WhatsApp-Text von "${name}" kopiert!`);
    } catch {
      toast.error("Kopieren fehlgeschlagen");
    }
  };

  // Category counts from data
  const categoryCounts = useMemo(() => {
    if (!categories) return {};
    return categories.reduce((acc: Record<string, boolean>, cat: string) => {
      acc[cat] = true;
      return acc;
    }, {});
  }, [categories]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            LR Produktbilder
          </h1>
          <p className="text-muted-foreground mt-1">
            {totalCount ? `${totalCount} Produkte` : "Lade..."} aus Linas Botpress-Datenbank mit Originalbildern.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => importMutation.mutate()}
          disabled={importMutation.isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${importMutation.isPending ? "animate-spin" : ""}`} />
          {importMutation.isPending ? "Importiere..." : "Neu importieren"}
        </Button>
      </div>

      {/* Search + Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Produkt suchen..."
            className="pl-9"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(0); }}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setSelectedCategory(null); setPage(0); }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
            !selectedCategory
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
          }`}
        >
          Alle
        </button>
        {(categories || []).map((cat: string) => {
          const CatIcon = CATEGORY_ICONS[cat] || Package;
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(isActive ? null : cat); setPage(0); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border flex items-center gap-1.5 ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : `${CATEGORY_COLORS[cat] || "bg-muted/50 text-muted-foreground border-border"} hover:opacity-80`
              }`}
            >
              <CatIcon className="h-3 w-3" />
              {cat}
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3">
                <div className="aspect-square bg-muted rounded-lg mb-3" />
                <div className="h-3 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !products || products.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Keine Produkte gefunden</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery ? "Versuche einen anderen Suchbegriff." : "Klicke auf 'Neu importieren' um die Produkte aus Botpress zu laden."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product: any) => {
              const CatIcon = CATEGORY_ICONS[product.category] || Package;
              return (
                <Card
                  key={product.id}
                  className="group hover:border-primary/30 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/5"
                  onClick={() => setPreviewProduct(product)}
                >
                  <CardContent className="p-3">
                    {/* Product Image */}
                    <div className="aspect-square rounded-lg overflow-hidden bg-white mb-3 relative">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain p-2"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                      </div>
                    </div>

                    {/* Product Info */}
                    <h3 className="text-xs font-medium line-clamp-2 leading-tight mb-1.5">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1.5 py-0 ${CATEGORY_COLORS[product.category] || ""}`}
                      >
                        <CatIcon className="h-2.5 w-2.5 mr-0.5" />
                        {product.category}
                      </Badge>
                      {product.price && (
                        <span className="text-[10px] font-semibold text-primary">
                          {parseFloat(product.price).toFixed(2)}€
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalCount && totalCount > PAGE_SIZE && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                Zurück
              </Button>
              <span className="text-sm text-muted-foreground">
                Seite {page + 1} von {Math.ceil(totalCount / PAGE_SIZE)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={(page + 1) * PAGE_SIZE >= totalCount}
                onClick={() => setPage(p => p + 1)}
              >
                Weiter
              </Button>
            </div>
          )}
        </>
      )}

      {/* Product Detail Dialog */}
      <Dialog open={!!previewProduct} onOpenChange={() => setPreviewProduct(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {previewProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">{previewProduct.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                {/* Category + Price */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={CATEGORY_COLORS[previewProduct.category] || ""}
                  >
                    {previewProduct.category}
                  </Badge>
                  {previewProduct.price && (
                    <Badge variant="secondary" className="font-semibold">
                      {parseFloat(previewProduct.price).toFixed(2)} €
                    </Badge>
                  )}
                </div>

                {/* Large Image */}
                <div className="rounded-lg overflow-hidden bg-white">
                  <img
                    src={previewProduct.imageUrl}
                    alt={previewProduct.name}
                    className="w-full object-contain max-h-80 p-4"
                  />
                </div>

                {/* Description */}
                {previewProduct.descriptionWA && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Beschreibung</p>
                    <p className="text-sm whitespace-pre-line">{previewProduct.descriptionWA}</p>
                  </div>
                )}

                {/* WhatsApp Text */}
                {previewProduct.whatsappText && previewProduct.whatsappText !== previewProduct.name && (
                  <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                    <p className="text-xs font-medium text-green-400 mb-1">WhatsApp-Text</p>
                    <p className="text-sm">{previewProduct.whatsappText}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full"
                    onClick={() => handleCopyImage(previewProduct.imageUrl, previewProduct.name)}
                  >
                    <Copy className="h-4 w-4 mr-2" /> Bild-URL kopieren
                  </Button>
                  {previewProduct.whatsappText && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleCopyWhatsApp(previewProduct.whatsappText, previewProduct.name)}
                    >
                      <Copy className="h-4 w-4 mr-2" /> WhatsApp-Text kopieren
                    </Button>
                  )}
                  <Button variant="outline" className="w-full" asChild>
                    <a href={previewProduct.imageUrl} download target="_blank" rel="noreferrer">
                      <Download className="h-4 w-4 mr-2" /> Bild herunterladen
                    </a>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
