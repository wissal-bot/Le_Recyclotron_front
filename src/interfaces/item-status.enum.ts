/**
 * Enum representing the possible status values for items
 */
export enum ItemStatus {
  SALABLE = 0, // Item can be sold
  UNSALABLE = 1, // Item cannot be sold
  MATERIAL = 2, // Item is used for materials
  REPARABLE = 3, // Item needs repair
}

/**
 * Helper function to get a human-readable label for each status
 */
export function getItemStatusLabel(status: ItemStatus | number): string {
  switch (status) {
    case ItemStatus.SALABLE:
      return 'Salable';
    case ItemStatus.UNSALABLE:
      return 'Unsalable';
    case ItemStatus.MATERIAL:
      return 'Material';
    case ItemStatus.REPARABLE:
      return 'Reparable';
    default:
      return 'Unknown';
  }
}

/**
 * Helper function to get all available item statuses
 */
export function getAllItemStatuses(): Array<{ value: number; label: string }> {
  return [
    {
      value: ItemStatus.SALABLE,
      label: getItemStatusLabel(ItemStatus.SALABLE),
    },
    {
      value: ItemStatus.UNSALABLE,
      label: getItemStatusLabel(ItemStatus.UNSALABLE),
    },
    {
      value: ItemStatus.MATERIAL,
      label: getItemStatusLabel(ItemStatus.MATERIAL),
    },
    {
      value: ItemStatus.REPARABLE,
      label: getItemStatusLabel(ItemStatus.REPARABLE),
    },
  ];
}
