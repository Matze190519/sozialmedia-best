import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Package, Search, Check, Image } from "lucide-react";

interface ProductImagePickerProps {
  contentPostId: number | null;
  onImageSelected: (url: string) => void;
}

export function ProductImagePicker({ contentPostId, onImageSelected }: ProductImagePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: categories } = trpc.products.categories.useQuery();
  const { data: products, isLoading } = trpc.products.list.useQuery({
    category: selectedCategory || undefined,
    search: search || undefined,
    limit: 30,
    offset: 0,
  });

  const attachMut = trpc.media.attachProductImage.useMutation({
    onSuccess: (data) => {
      toast.success("Produktbild angehängt!");
      onImageSelected(data.url);
      setOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSelect = (product: any) => {
    if (contentPostId) {
      attachMut.mutate({
        contentPostId,
        imageUrl: product.imageUrl,
        productName: product.name,
      });
    } else {
      onImageSelected(product.imageUrl);
      toast.success(`Produktbild "${product.name}" ausgewählt!`);
      setOpen(false);
    }
  };

  return (
    <>
      <Card className="border-orange-500/30 bg-orange-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-orange-400">
            <Package className="h-4 w-4" />
            LR Produktbild verwenden
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Wähle ein Original-Produktbild aus Linas Datenbank (226 Produkte).
          </p>
          <Button
            variant="outline"
            className="w-full gap-2 border-orange-500/30 hover:border-orange-500/60"
            onClick={() => setOpen(true)}
          >
            <Image className="h-4 w-4" />
            Produktbild auswählen
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-400" />
              LR Produktbild auswählen
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Produkt suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant={selectedCategory === "" ? "default" : "outline"}
                className="cursor-pointer text-[10px]"
                onClick={() => setSelectedCategory("")}
              >
                Alle
              </Badge>
              {categories?.map((cat: any) => (
                <Badge
                  key={typeof cat === "string" ? cat : cat.category}
                  variant={selectedCategory === (typeof cat === "string" ? cat : cat.category) ? "default" : "outline"}
                  className="cursor-pointer text-[10px]"
                  onClick={() => setSelectedCategory(typeof cat === "string" ? cat : cat.category)}
                >
                  {typeof cat === "string" ? cat : cat.category}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mt-3">
            {isLoading ? (
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {products.map((product: any) => (
                  <button
                    key={product.id}
                    className="group relative aspect-square bg-white rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all"
                    onClick={() => handleSelect(product)}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain p-1.5"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Check className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                      <p className="text-[9px] text-white truncate font-medium">{product.name}</p>
                      {product.price && (
                        <p className="text-[8px] text-white/70">{parseFloat(product.price).toFixed(2)}€</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {search ? `Keine Produkte für "${search}" gefunden.` : "Keine Produkte vorhanden."}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
