const ONES = [
  "",
  "ერთი",
  "ორი",
  "სამი",
  "ოთხი",
  "ხუთი",
  "ექვსი",
  "შვიდი",
  "რვა",
  "ცხრა",
  "ათი",
  "თერთმეტი",
  "თორმეტი",
  "ცამეტი",
  "თოთხმეტი",
  "თხუთმეტი",
  "თექვსმეტი",
  "ჩვიდმეტი",
  "თვრამეტი",
  "ცხრამეტი",
];

function under20(n: number): string {
  return ONES[n] ?? "";
}

function under100(n: number): string {
  if (n < 20) return under20(n);
  const twenties = Math.floor(n / 20);
  const rem = n % 20;
  const stems = ["", "ოც", "ორმოც", "სამოც", "ოთხმოც"];
  const stem = stems[twenties];
  if (rem === 0) return stem + "ი";
  return stem + "და" + under20(rem);
}

function hundreds(n: number): string {
  const map: Record<number, string> = {
    1: "ასი",
    2: "ორასი",
    3: "სამასი",
    4: "ოთხასი",
    5: "ხუთასი",
    6: "ექვსასი",
    7: "შვიდასი",
    8: "რვაასი",
    9: "ცხრაასი",
  };
  return map[n] ?? "";
}

function under1000(n: number): string {
  if (n < 100) return under100(n);
  const h = Math.floor(n / 100);
  const rem = n % 100;
  const hWord = hundreds(h);
  if (rem === 0) return hWord;
  const stem = hWord.endsWith("ი") ? hWord.slice(0, -1) : hWord;
  return stem + " " + under100(rem);
}

function integerToKa(n: number): string {
  if (n === 0) return "ნული";
  if (n < 1000) return under1000(n);
  const thousands = Math.floor(n / 1000);
  const rem = n % 1000;
  let head: string;
  if (thousands === 1) head = "ათასი";
  else head = under1000(thousands) + " ათასი";
  if (rem === 0) return head;
  const stem = head.endsWith("ი") ? head.slice(0, -1) : head;
  return stem + " " + under1000(rem);
}

export function amountInWordsKa(tetri: number): string {
  const lari = Math.floor(Math.abs(tetri) / 100);
  const tet = Math.abs(tetri) % 100;
  const lariWord = integerToKa(lari);
  const tetWord = integerToKa(tet);
  return `${lariWord} ლარი და ${tetWord} თეთრი`;
}
