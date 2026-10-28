export function calculateQuote({ width, height, depth, shelves, wood, finish, delivery }, pricing) {
  const retro = width * height
  const lato = height * depth
  const ripiano = depth * width
  const externalArea = 2 * (retro + lato + ripiano) / 10000
  const shelfArea = 2 * shelves * ripiano / 10000
  const totalArea = externalArea + shelfArea
  const woodCost = totalArea * wood.price
  const finishCost = totalArea * finish.price
  const subtotal = woodCost + finishCost + delivery.price
  const vat = subtotal * pricing.vat
  return { externalArea, shelfArea, totalArea, woodCost, finishCost, subtotal, vat, total: subtotal + vat }
}




