export function normalizeDraft(draft) {
  return {
    title: String(draft.title ?? '').trim(),
    price: Number(draft.price),
    stock: Number(draft.stock),
    description: String(draft.description ?? '').trim(),
  }
}

export function validateDraft(draft) {
  const errors = {}
  const normalized = normalizeDraft(draft)

  const title = normalized.title
  if (!title) {
    errors.title = 'Назва обов\'язкова'
  } else if (title.length < 1 || title.length > 120) {
    errors.title = 'Назва має містити від 1 до 120 символів'
  }

  const price = normalized.price
  if (draft.price === '' || draft.price === null || draft.price === undefined) {
    errors.price = 'Ціна обов\'язкова'
  } else if (!Number.isFinite(price) || price <= 0) {
    errors.price = 'Ціна має бути додатнім числом'
  }

  const stock = normalized.stock
  if (draft.stock === '' || draft.stock === null || draft.stock === undefined) {
    errors.stock = 'Залишок обов\'язковий'
  } else if (!Number.isInteger(stock) || stock < 0) {
    errors.stock = 'Залишок має бути цілим невід\'ємним числом'
  }

  const description = normalized.description
  if (!description) {
    errors.description = 'Опис обов\'язковий'
  } else if (description.length < 1 || description.length > 2000) {
    errors.description = 'Опис має містити від 1 до 2000 символів'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    normalized,
  }
}