export function calculateDiscount(mrp: number, sellingPrice: number): number {
  return mrp > sellingPrice ? Math.round((1 - sellingPrice / mrp) * 100) : 0
}
