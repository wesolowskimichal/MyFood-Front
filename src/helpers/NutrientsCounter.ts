import { JournalMeal, Nutrients, ProductDetails, Unit } from '../types/Types'

/**
 * Calculates the nutrients (proteins, fats, carbs) in a given amount of a product.
 *
 * @param {number} amount - The amount of the product.
 * @param {Unit} unit - The unit of the amount (kg, g, l, ml).
 * @param {ProductDetails} product - The details of the product including nutrient information.
 * @returns {Nutrients} - The calculated nutrients for the given amount of the product.
 */
export const NutrientsCounter = (amount: number, unit: Unit, product: ProductDetails): Nutrients => {
  const amountBig = product.unit === 'kg' || product.unit === 'l' ? product.amount : product.amount / 1000
  const amountSmall = product.unit === 'kg' || product.unit === 'l' ? product.amount * 1000 : product.amount
  const proportion = unit === 'kg' || unit == 'l' ? amount / amountBig : amount / amountSmall

  return {
    proteins: product.protein * proportion,
    fats: product.fat * proportion,
    carbs: product.carbons * proportion
  }
}

/**
 * Calculates the total nutrients (proteins, fats, carbs) for a meal from the journal. Use only on init because it works on db unit
 *
 * @param {JournalMeal} journalMeal - The journal meal containing elements with their respective amounts and product details.
 * @returns {Nutrients} - The total calculated nutrients for the meal.
 */
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
