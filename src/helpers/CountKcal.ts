import { Nutrients } from '../types/Types'

export const CountKcal = (nutriets: Nutrients) => {
  return (nutriets.proteins + nutriets.carbs) * 4 + nutriets.fats * 9
}
