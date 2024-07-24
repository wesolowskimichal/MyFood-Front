import { JournalMeal, Nutrients, ProductDetails, Unit } from '../types/Types'

export const NutrientsCounter = (amount: number, unit: Unit, product: ProductDetails): Nutrients => {
  const amountBig = product.unit === 'kg' || product.unit === 'l' ? product.amount : product.amount / 1000
  const amountSmall = product.unit === 'kg' || product.unit === 'l' ? product.amount * 1000 : product.amount
  const proportion = unit === 'kg' || unit == 'l' ? amount / amountBig : amount / amountSmall
  return {
    proteins: product.fat * proportion,
    fats: product.fat * proportion,
    carbs: product.carbons * proportion
  }
}

export const NutrientsCounterMap = (journalMeal: JournalMeal): Nutrients => {
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
