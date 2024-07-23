import { JournalMeal, ProductDetails } from '../types/Types'

export const NutrientsCounter = (
  amount: number,
  product: ProductDetails
): { proteins: number; fats: number; carbs: number } => {
  return {
    proteins: amount * (product.protein / product.amount),
    fats: amount * (product.fat / product.amount),
    carbs: amount * (product.carbons / product.amount)
  }
}

export const NutrientsCounterMap = (journalMeal: JournalMeal): { proteins: number; fats: number; carbs: number } => {
  return journalMeal.elements.reduce(
    (acc, curr) => ({
      proteins: acc.proteins + curr.amount * (curr.obj.protein / curr.obj.amount),
      fats: acc.fats + curr.amount * (curr.obj.fat / curr.obj.amount),
      carbs: acc.carbs + curr.amount * (curr.obj.carbons / curr.obj.amount)
    }),
    {
      proteins: 0,
      fats: 0,
      carbs: 0
    }
  )
}
