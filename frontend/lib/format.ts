/** Turns "NO_PRIORITY" into "No Priority", "ON_HOLD" into "On Hold", "TODO" into "To Do", etc. */
export function formatLabel(value: string) {
    if (value === 'TODO') return 'To Do';
    return value
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }