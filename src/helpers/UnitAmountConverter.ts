import { ProductDetails, Unit } from '../types/Types'

export const UnitAmountConverter = (amount: number, unit: Unit): { amount: number; unit: Unit } => {
  let newAmount = amount
  let newUnit = unit
  if (unit === 'g' && amount > 1000 && amount % 1000 === 0) {
    newAmount = Math.floor(amount / 1000)
    newUnit = 'kg'
  }
  if (unit === 'kg' && amount < 1) {
    newAmount = Math.floor(amount * 1000)
    newUnit = 'g'
  }
  if (unit === 'ml' && amount > 1000 && amount % 1000 === 0) {
    newAmount = Math.floor(amount / 1000)
    newUnit = 'kg'
  }
  if (unit === 'l' && amount < 1) {
    newAmount = Math.floor(amount * 1000)
    newUnit = 'ml'
  }
  return { amount: newAmount, unit: newUnit }
}

export const UnitProductConverter = (amount: number, unit: Unit, product: ProductDetails) => {
  if (product.unit === unit) {
    return amount
  }

  let convertedAmount = 0

  if ((unit === 'g' && product.unit === 'kg') || (unit === 'kg' && product.unit === 'g')) {
    if (unit === 'g') {
      convertedAmount = amount / 1000
    } else {
      convertedAmount = amount * 1000
    }
  } else if ((unit === 'ml' && product.unit === 'l') || (unit === 'l' && product.unit === 'ml')) {
    if (unit === 'ml') {
      convertedAmount = amount / 1000
    } else {
      convertedAmount = amount * 1000
    }
  } else {
    throw new Error('Incompatible units')
  }

  return convertedAmount
}
