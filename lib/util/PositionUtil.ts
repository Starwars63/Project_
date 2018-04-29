export function center(bounds:any) {
  return {
    x: bounds.x + (bounds.width / 2),
    y: bounds.y + (bounds.height / 2)
  };
}


export function delta(a:any, b:any) {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  };
}