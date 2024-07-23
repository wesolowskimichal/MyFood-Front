import { Unit } from '../types/Types'

export const UnitAmountConverter = (amount: number, unit: Unit): { amount: number; unit: Unit } => {
  let newAmount = amount
  let newUnit = unit
  if (unit === 'g' && amount > 1000) {
    newAmount = Math.floor(amount / 1000)
    newUnit = 'kg'
  }
  if (unit === 'kg' && amount < 1) {
    newAmount = Math.floor(amount * 1000)
    newUnit = 'g'
  }
  if (unit === 'ml' && amount > 1000) {
    newAmount = Math.floor(amount / 1000)
    newUnit = 'kg'
  }
  if (unit === 'l' && amount < 1) {
    newAmount = Math.floor(amount * 1000)
    newUnit = 'ml'
  }
  return { amount: newAmount, unit: newUnit }
}
