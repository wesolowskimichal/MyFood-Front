import { JournalEntry, Nutrients, ProductDetails, Recipe, Unit } from '../types/Types'

/**
 * Calculates the nutrients (proteins, fats, carbs) in a given amount of a product.
 *
 * @param {number} amount - The amount of the product.
 * @param {Unit} unit - The unit of the amount (kg, g, l, ml).
 * @param {ProductDetails} product - The details of the product including nutrient information.
 * @returns {Nutrients} - The calculated nutrients for the given amount of the product.
 */
interface ProductType {
  protein: number
  fat: number
  carbons: number
  amount: number
  unit: Unit
}
export const NutrientsCounter = (amount: number, unit: Unit, product: ProductType, floor = false): Nutrients => {
  const amountBig = product.unit === 'kg' || product.unit === 'l' ? product.amount : product.amount / 1000
  const amountSmall = product.unit === 'kg' || product.unit === 'l' ? product.amount * 1000 : product.amount
  const proportion = unit === 'kg' || unit == 'l' ? amount / amountBig : amount / amountSmall
  if (floor) {
    return {
      proteins: Math.floor(product.protein * proportion),
      fats: Math.floor(product.fat * proportion),
      carbs: Math.floor(product.carbons * proportion)
    }
  }

  return {
    proteins: product.protein * proportion,
    fats: product.fat * proportion,
    carbs: product.carbons * proportion
  }
}

/**
 * Calculates the total nutrients (proteins, fats, carbs) for a meal from the journal. Use only on init because it works on db unit
 *
 * @param {JournalEntry} journalEntry - The journal meal containing elements with their respective amounts and product details.
 * @returns {Nutrients} - The total calculated nutrients for the meal.
 */
export const NutrientsCounterMap = (journalEntry: JournalEntry): Nutrients => {
  return journalEntry.journal_entities.reduce(
    (acc, curr) => {
      const objAmount = () => {
        if (curr.object.type === 'product') {
          return (curr.object.entry as ProductDetails).amount
        }
        return (curr.object.entry as Recipe).servings
      }
      return {
        proteins: acc.proteins + curr.object.amount * (curr.object.entry.protein / objAmount()),
        fats: acc.fats + curr.object.amount * (curr.object.entry.fat / objAmount()),
        carbs: acc.carbs + curr.object.amount * (curr.object.entry.carbons / objAmount())
      }
    },
    {
      proteins: 0,
      fats: 0,
      carbs: 0
    }
  )
}
